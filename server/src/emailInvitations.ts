
import { createHash, randomBytes } from 'node:crypto';
import type {
  IncomingMessage,
  ServerResponse,
} from 'node:http';

import { pool } from './db.ts';
import {
  HttpError,
  send,
  body,
  str,
  validUuid,
} from './http.ts';

import type { Identity } from './server.ts';

import {
  sendInvitationEmail,
} from './mail/invitationMailer.ts';

// Normalisation de l'adresse e-mail
const normalizeEmail = (value: string) =>
  value.trim().toLowerCase();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Le serveur conserve le hash du code, pas le code brut.
const tokenHash = (code: string) =>
  createHash('sha256')
    .update(code)
    .digest('hex');

// Code aléatoire de 144 bits.
const makeCode = () =>
  randomBytes(18).toString('hex').toUpperCase();

type ProjectInfo = {
  workspace_id: string;
  title: string;
  role: string;
};

type InvitationRow = {
  id: string;
  project_id: string;
  workspace_id: string;
  recipient_email: string;
  role: string;
  expires_at: Date;
  accepted_at: Date | null;
  delivery_status: string;
};

/**
 * MAIL-02 : gestion des invitations par e-mail.
 *
 * Retourne true si la requête a été traitée.
 */
export async function handleEmailInvitations(
  req: IncomingMessage,
  res: ServerResponse,
  user: Identity,
  path: string
): Promise<boolean> {
  const method = req.method;

  // ======================================
  // 1. ENVOYER UNE INVITATION PAR E-MAIL
  // ======================================

  const create = path.match(
    /^\/api\/data\/projects\/([a-f\d-]{36})\/email-invitations$/i
  );

  if (create && method === 'POST') {
    const projectId = create[1];

    if (!validUuid(projectId)) {
      throw new HttpError(
        400,
        'Identifiant de projet invalide.'
      );
    }

    // Vérifier que l'expéditeur est responsable.
    const project = await pool.query<ProjectInfo>(
      `SELECT p.workspace_id, p.title, m.role
       FROM projects p
       JOIN workspace_members m
         ON m.workspace_id = p.workspace_id
        AND m.user_id = $1
       WHERE p.id = $2`,
      [user.id, projectId]
    );

    const currentProject = project.rows[0];

    if (!currentProject) {
      throw new HttpError(
        404,
        'Projet introuvable.'
      );
    }

    if (
      !['owner', 'admin'].includes(
        currentProject.role
      )
    ) {
      throw new HttpError(
        403,
        'Seul un responsable peut inviter.'
      );
    }

    const payload = await body(req);

    const email = normalizeEmail(
      str(payload.email)
    );

    if (
      email.length > 254 ||
      !emailPattern.test(email)
    ) {
      throw new HttpError(
        400,
        'Adresse e-mail invalide.'
      );
    }

    const role =
      str(payload.role) || 'viewer';

    if (
      !['viewer', 'editor'].includes(role)
    ) {
      throw new HttpError(
        400,
        'Rôle invalide.'
      );
    }

    // Vérifier si l'utilisateur est déjà membre.
    const existing = await pool.query(
      `SELECT 1
       FROM workspace_members wm
       JOIN app_users u
         ON u.id = wm.user_id
       WHERE wm.workspace_id = $1
         AND lower(u.email) = $2`,
      [
        currentProject.workspace_id,
        email,
      ]
    );

    if (existing.rowCount) {
      throw new HttpError(
        409,
        'Cet utilisateur est déjà membre.'
      );
    }

    // Éviter plusieurs invitations encore valides.
    const pending = await pool.query(
      `SELECT 1
       FROM taskify_email_invitations
       WHERE project_id = $1
         AND lower(recipient_email) = $2
         AND accepted_at IS NULL
         AND expires_at > now()
       LIMIT 1`,
      [projectId, email]
    );

    if (pending.rowCount) {
      throw new HttpError(
        409,
        'Une invitation valide existe déjà pour cette adresse.'
      );
    }

    // Générer le code.
    const code = makeCode();

    // Expiration après 7 jours.
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    // Enregistrer l'invitation.
    const invitation = await pool.query<{
      id: string;
    }>(
      `INSERT INTO taskify_email_invitations (
         project_id,
         workspace_id,
         recipient_email,
         role,
         token_hash,
         expires_at,
         created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        projectId,
        currentProject.workspace_id,
        email,
        role,
        tokenHash(code),
        expiresAt,
        user.id,
      ]
    );

    // Envoyer le même code par e-mail.
    const delivered = await sendInvitationEmail({
      toEmail: email,
      projectName: currentProject.title,
      code,
      expiresAt,
    });

    await pool.query(
      `UPDATE taskify_email_invitations
       SET delivery_status = $1
       WHERE id = $2`,
      [
        delivered.status,
        invitation.rows[0].id,
      ]
    );

    send(res, 201, {
      id: invitation.rows[0].id,
      deliveryStatus: delivered.status,
      message:
        delivered.status === 'sent'
          ? 'Invitation enregistrée ; e-mail accepté par le fournisseur SMTP.'
          : 'Invitation enregistrée, mais e-mail non envoyé.',
    });

    return true;
  }

  // ======================================
  // 2. LISTER LES INVITATIONS REÇUES
  // ======================================

  if (
    path === '/api/data/email-invitations/received' &&
    method === 'GET'
  ) {
    const own = await pool.query<{
      email: string;
    }>(
      `SELECT email
       FROM app_users
       WHERE id = $1`,
      [user.id]
    );

    if (!own.rows[0]) {
      throw new HttpError(
        401,
        'Compte introuvable.'
      );
    }

    const received = await pool.query(
      `SELECT
         i.id,
         i.project_id AS "projectId",
         p.title AS "projectName",
         i.role,
         i.expires_at AS "expiresAt",
         i.delivery_status AS "deliveryStatus"
       FROM taskify_email_invitations i
       JOIN projects p
         ON p.id = i.project_id
       WHERE lower(i.recipient_email) = lower($1)
         AND i.accepted_at IS NULL
         AND i.expires_at > now()
       ORDER BY i.created_at DESC
       LIMIT 100`,
      [own.rows[0].email]
    );

    send(res, 200, {
      invitations: received.rows,
    });

    return true;
  }

  // ======================================
  // 3. ACCEPTER UNE INVITATION AVEC UN CODE
  // ======================================

  if (
    path === '/api/data/email-invitations/accept' &&
    method === 'POST'
  ) {
    const payload = await body(req);

    const code = str(payload.code)
      .trim()
      .toUpperCase();

    if (!/^[A-F0-9]{36}$/.test(code)) {
      throw new HttpError(
        400,
        'Format du code invalide.'
      );
    }

    const conn = await pool.connect();

    try {
      await conn.query('BEGIN');

      // Récupérer l'adresse de l'utilisateur connecté.
      const own = await conn.query<{
        email: string;
      }>(
        `SELECT email
         FROM app_users
         WHERE id = $1`,
        [user.id]
      );

      if (!own.rows[0]) {
        throw new HttpError(
          401,
          'Compte introuvable.'
        );
      }

      // Rechercher le hash du code.
      const found = await conn.query<InvitationRow>(
        `SELECT *
         FROM taskify_email_invitations
         WHERE token_hash = $1
         FOR UPDATE`,
        [tokenHash(code)]
      );

      const invitation = found.rows[0];

      if (
        !invitation ||
        invitation.accepted_at ||
        new Date(
          invitation.expires_at
        ).getTime() <= Date.now()
      ) {
        throw new HttpError(
          400,
          'Code invalide, expiré ou déjà utilisé.'
        );
      }

      // Le code est réservé à l'e-mail invité.
      if (
        normalizeEmail(own.rows[0].email) !==
        normalizeEmail(
          invitation.recipient_email
        )
      ) {
        throw new HttpError(
          403,
          'Ce code est réservé à une autre adresse e-mail.'
        );
      }

      // Vérifier que le projet existe encore.
      const project = await conn.query(
        `SELECT 1
         FROM projects
         WHERE id = $1
           AND workspace_id = $2`,
        [
          invitation.project_id,
          invitation.workspace_id,
        ]
      );

      if (!project.rowCount) {
        throw new HttpError(
          404,
          'Projet introuvable.'
        );
      }

      // Vérifier si l'utilisateur est déjà membre.
      const already = await conn.query(
        `SELECT 1
         FROM workspace_members
         WHERE workspace_id = $1
           AND user_id = $2`,
        [
          invitation.workspace_id,
          user.id,
        ]
      );

      if (already.rowCount) {
        throw new HttpError(
          409,
          'Vous êtes déjà membre de cet espace.'
        );
      }

      // Ajouter le nouveau membre.
      await conn.query(
        `INSERT INTO workspace_members (
           workspace_id,
           user_id,
           role
         )
         VALUES ($1, $2, $3)`,
        [
          invitation.workspace_id,
          user.id,
          invitation.role,
        ]
      );

      // Marquer le code comme utilisé.
      await conn.query(
        `UPDATE taskify_email_invitations
         SET accepted_at = now(),
             accepted_by = $1
         WHERE id = $2`,
        [
          user.id,
          invitation.id,
        ]
      );

      await conn.query('COMMIT');

      send(res, 200, {
        ok: true,
        workspaceId:
          invitation.workspace_id,
        projectId:
          invitation.project_id,
      });

      return true;
    } catch (error) {
      await conn.query('ROLLBACK');
      throw error;
    } finally {
      conn.release();
    }
  }

  return false;
}

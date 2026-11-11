
export type InvitationMessage = {
  toEmail: string;
  projectName: string;
  inviterName?: string;
  code: string;
  expiresAt?: Date;
  inviteUrl?: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]!);
}

export function renderInvitationEmail(
  invitation: InvitationMessage
) {
  const projectName = escapeHtml(invitation.projectName);
  const code = escapeHtml(invitation.code);
  const inviterName = escapeHtml(
    invitation.inviterName || 'Un responsable du projet'
  );

  const expiration = invitation.expiresAt
    ? `Ce code expire le ${invitation.expiresAt.toLocaleString('fr-FR', {
        timeZone: 'UTC',
      })} (UTC).`
    : 'Vérifiez la date d’expiration dans Taskify.';

  const url = invitation.inviteUrl;

  if (
    url &&
    !/^https:\/\/[^\s]+$|^taskify:\/\/[^\s]+$/i.test(url)
  ) {
    throw new Error('Lien d’invitation invalide.');
  }

  const button = url
    ? `
      <p style="margin-top:24px;text-align:center">
        <a
          href="${escapeHtml(url)}"
          style="
            background:#283f7f;
            color:#ffffff;
            text-decoration:none;
            padding:14px 24px;
            border-radius:8px;
            display:inline-block;
          "
        >
          Ouvrir l'invitation dans Taskify
        </a>
      </p>
    `
    : '';

  const subject =
    `Taskify — Invitation au projet ${invitation.projectName}`;

  const html = `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
      </head>

      <body style="
        font-family:Arial,sans-serif;
        background:#f5f7fb;
        padding:24px;
        color:#19223a;
      ">
        <div style="
          max-width:560px;
          margin:auto;
          background:white;
          border-radius:14px;
          padding:28px;
        ">
          <h1 style="color:#283f7f">
            Taskify
          </h1>

          <h2>Invitation à collaborer</h2>

          <p>
            ${inviterName} vous invite à rejoindre
            le projet <strong>${projectName}</strong>.
          </p>

          <p>
            Copiez le code suivant et saisissez-le
            dans la section
            <strong>Invitations reçues</strong>
            de l'application Taskify.
          </p>

          <div style="
            background:#eef3ff;
            border:1px solid #a0b3ea;
            border-radius:10px;
            padding:20px;
            text-align:center;
            font-size:26px;
            font-weight:bold;
            letter-spacing:3px;
            user-select:all;
          ">
            ${code}
          </div>

          ${button}

          <p>${escapeHtml(expiration)}</p>

          <p style="
            color:#667085;
            font-size:13px;
          ">
            Si vous n'attendiez pas cette invitation,
            ignorez cet e-mail.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Invitation Taskify

${invitation.inviterName || 'Un responsable du projet'}
vous invite à rejoindre le projet ${invitation.projectName}.

Votre code d'invitation :

${invitation.code}

Ouvrez Taskify > Invitations reçues.
Copiez et saisissez ce code.

${url ? `Lien : ${url}` : ''}

${expiration}
  `.trim();

  return { subject, html, text };
}

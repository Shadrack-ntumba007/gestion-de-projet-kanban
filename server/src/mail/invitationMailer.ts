
import nodemailer from 'nodemailer';

import {
  renderInvitationEmail,
  type InvitationMessage,
} from './invitationTemplate.ts';

export type MailSendResult =
  | { status: 'sent'; messageId: string }
  | { status: 'not_configured' }
  | { status: 'failed'; reason: string };

export async function sendInvitationEmail(
  invitation: InvitationMessage
): Promise<MailSendResult> {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    MAIL_FROM,
  } = process.env;

  if (
    !SMTP_HOST ||
    !SMTP_USER ||
    !SMTP_PASS ||
    !MAIL_FROM
  ) {
    return { status: 'not_configured' };
  }

  const port = Number(SMTP_PORT || '587');

  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    return {
      status: 'failed',
      reason: 'Port SMTP invalide.',
    };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,

    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },

    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });

  const message = renderInvitationEmail(invitation);

  try {
    const result = await transporter.sendMail({
      from: MAIL_FROM,
      to: invitation.toEmail,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });

    return {
      status: 'sent',
      messageId: result.messageId,
    };
  } catch (error) {
    console.error('Erreur SMTP Taskify :', error);

    return {
      status: 'failed',
      reason: 'Envoi du mail impossible.',
    };
  } finally {
    transporter.close();
  }
}

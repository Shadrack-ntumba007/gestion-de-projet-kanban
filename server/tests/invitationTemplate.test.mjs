
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  renderInvitationEmail,
} from '../src/mail/invitationTemplate.ts';

test('Le mail contient le code d’invitation', () => {
  const mail = renderInvitationEmail({
    toEmail: 'test@example.com',
    projectName: 'Projet Kanban',
    code: 'ABC-1234',
  });

  assert.match(mail.html, /ABC-1234/);
  assert.match(mail.text, /ABC-1234/);
});

test('Le mail contient le projet', () => {
  const mail = renderInvitationEmail({
    toEmail: 'test@example.com',
    projectName: 'Taskify Mobile',
    code: 'XYZ-5678',
  });

  assert.match(mail.subject, /Taskify Mobile/);
});

test('Le HTML non fiable est échappé', () => {
  const mail = renderInvitationEmail({
    toEmail: 'test@example.com',
    projectName: '<script>alert(1)</script>',
    code: 'ABC-1234',
  });

  assert.ok(!mail.html.includes('<script>'));
  assert.match(mail.html, /&lt;script&gt;/);
});

test('Le mail ne contient aucun script', () => {
  const mail = renderInvitationEmail({
    toEmail: 'test@example.com',
    projectName: 'Kanban',
    code: 'ABC-1234',
  });

  assert.ok(!mail.html.includes('<script'));
  assert.ok(!mail.html.includes('onclick='));
});

test('Un lien dangereux est refusé', () => {
  assert.throws(() => {
    renderInvitationEmail({
      toEmail: 'test@example.com',
      projectName: 'Kanban',
      code: 'ABC-1234',
      inviteUrl: 'javascript:alert(1)',
    });
  });
});

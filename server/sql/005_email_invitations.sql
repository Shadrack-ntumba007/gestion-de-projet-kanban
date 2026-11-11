
-- TASKIFY : Migration PostgreSQL V5
-- Invitations par e-mail
-- Ne supprime aucune table existante.

CREATE TABLE IF NOT EXISTS taskify_email_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    project_id UUID NOT NULL
        REFERENCES projects(id)
        ON DELETE CASCADE,

    workspace_id UUID NOT NULL
        REFERENCES workspaces(id)
        ON DELETE CASCADE,

    recipient_email VARCHAR(254) NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'viewer'
        CHECK (role IN ('viewer', 'editor')),

    token_hash VARCHAR(64) NOT NULL UNIQUE,

    created_by UUID NOT NULL
        REFERENCES app_users(id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    expires_at TIMESTAMPTZ NOT NULL,

    accepted_at TIMESTAMPTZ,

    accepted_by UUID
        REFERENCES app_users(id),

    delivery_status VARCHAR(30)
        NOT NULL DEFAULT 'pending'
        CHECK (
            delivery_status IN (
                'pending',
                'sent',
                'failed',
                'not_configured'
            )
        )
);

CREATE INDEX IF NOT EXISTS
    idx_taskify_email_invitations_recipient
ON taskify_email_invitations (
    lower(recipient_email)
);

CREATE INDEX IF NOT EXISTS
    idx_taskify_email_invitations_project
ON taskify_email_invitations (
    project_id
);

CREATE INDEX IF NOT EXISTS
    idx_taskify_email_invitations_expires
ON taskify_email_invitations (
    expires_at
);

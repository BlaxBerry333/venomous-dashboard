-- Migration: auth.001_create_roles_table.sql
-- Service: auth
-- Description: Create roles table and convert users.role to users.role_id
-- Date: 2025-09-21

\c venomous_auth_db;


-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
    ('user', 'Regular user with basic access'),
    ('admin', 'Administrator with full access'),
    ('super_admin', 'Super administrator with all permissions')
ON CONFLICT (name) DO NOTHING;

-- Check if users table has role_id column, if not, migrate
DO $$
DECLARE
    has_role_column BOOLEAN;
    has_role_id_column BOOLEAN;
    user_role_id UUID;
    admin_role_id UUID;
BEGIN
    -- Check for existing columns
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='users' AND column_name='role'
    ) INTO has_role_column;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='users' AND column_name='role_id'
    ) INTO has_role_id_column;

    -- Get role IDs
    SELECT id INTO user_role_id FROM roles WHERE name = 'user';
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';

    -- Migration logic
    IF has_role_column AND NOT has_role_id_column THEN
        -- Migration from string role to role_id
        RAISE NOTICE 'Migrating from role column to role_id...';

        -- Add role_id column
        ALTER TABLE users ADD COLUMN role_id UUID;

        -- Migrate existing data
        UPDATE users SET role_id = user_role_id WHERE role = 'user' OR role IS NULL;
        UPDATE users SET role_id = admin_role_id WHERE role = 'admin';
        UPDATE users SET role_id = user_role_id WHERE role_id IS NULL; -- fallback

        -- Make role_id NOT NULL and add foreign key
        ALTER TABLE users ALTER COLUMN role_id SET NOT NULL;
        ALTER TABLE users ADD CONSTRAINT fk_users_role_id FOREIGN KEY (role_id) REFERENCES roles(id);

        -- Drop old role column
        ALTER TABLE users DROP COLUMN role;

        RAISE NOTICE 'Migration completed: role -> role_id';

    ELSIF NOT has_role_column AND NOT has_role_id_column THEN
        -- Fresh installation
        RAISE NOTICE 'Adding role_id column for fresh installation...';

        -- Add role_id column as nullable first
        ALTER TABLE users ADD COLUMN role_id UUID;

        -- Set default role for all users
        UPDATE users SET role_id = user_role_id WHERE role_id IS NULL;

        -- Make column NOT NULL and add constraint
        ALTER TABLE users ALTER COLUMN role_id SET NOT NULL;
        ALTER TABLE users ADD CONSTRAINT fk_users_role_id FOREIGN KEY (role_id) REFERENCES roles(id);

        RAISE NOTICE 'Fresh installation completed';

    ELSE
        RAISE NOTICE 'Migration already completed or role_id column exists';
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);


#!/bin/bash

# Database Initialization Script for Docker
# This script runs only once when the PostgreSQL container is first created
# It creates databases and initializes the auth database schema

set -e

echo "Starting database initialization..."

# Database connection parameters
DB_USER="venomous_dashboard_db"
DB_NAME="venomous_auth_db"

# Create databases for each microservice
echo "Creating databases..."

# Function to create database if it doesn't exist
create_db_if_not_exists() {
    local db_name=$1
    if ! psql -U "$DB_USER" -d postgres -lqt | cut -d \| -f 1 | grep -qw "$db_name"; then
        psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $db_name;"
        echo "Created database: $db_name"
    else
        echo "Database already exists: $db_name"
    fi
}

create_db_if_not_exists "venomous_auth_db"
create_db_if_not_exists "venomous_notes_db"
create_db_if_not_exists "venomous_media_db"
create_db_if_not_exists "venomous_workflows_db"

echo "Databases created successfully!"

# Initialize the authentication database schema
echo "Initializing authentication database schema..."

psql -U "$DB_USER" -d "$DB_NAME" -c "
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";

    -- Create roles table
    CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create users table
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role_id UUID NOT NULL REFERENCES roles(id),
        avatar TEXT,
        locale VARCHAR(10) NOT NULL DEFAULT 'en',
        timezone VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create auth_users table
    CREATE TABLE IF NOT EXISTS auth_users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        last_login TIMESTAMPTZ,
        failed_login_attempts INTEGER DEFAULT 0,
        account_locked_until TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create migrations table
    CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(50) PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW(),
        description TEXT
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
    CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);
    CREATE INDEX IF NOT EXISTS idx_auth_users_user_id ON auth_users(user_id);

    -- Insert default roles
    INSERT INTO roles (name, description) VALUES
        ('user', 'Regular user with basic access'),
        ('admin', 'Administrator with full access'),
        ('super_admin', 'Super administrator with all permissions')
    ON CONFLICT (name) DO NOTHING;
"

echo "Authentication database schema initialized successfully!"
echo "Database initialization completed!"
echo "Use \"./infrastructure/database/db.sh\" for further database management."
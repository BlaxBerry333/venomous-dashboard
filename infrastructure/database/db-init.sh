#!/bin/bash

# =============================================================================
# Venomous Dashboard DB - Microservices Database Initialization Script
# =============================================================================
#
# This script initializes PostgreSQL databases for the microservices architecture:
# - auth: Authentication and user management service
# - notes: Note-taking and content management service
# - media: File upload and media management service
# - workflows: Business process automation service
# =============================================================================

set -e

# Database connection parameters
DB_USER="venomous_dashboard_db"

# Database names
AUTH_DB="venomous_auth_db"
NOTES_DB="venomous_notes_db"
MEDIA_DB="venomous_media_db"
WORKFLOWS_DB="venomous_workflows_db"

# Function to create database if it doesn't exist
create_db_if_not_exists() {
    local db_name=$1
    if ! psql -U "$DB_USER" -d postgres -lqt | cut -d \| -f 1 | grep -qw "$db_name"; then
        psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $db_name;"
    fi
}

# =============================================================================
# Initialize all databases
# =============================================================================
create_db_if_not_exists "$AUTH_DB"
create_db_if_not_exists "$NOTES_DB"
create_db_if_not_exists "$MEDIA_DB"
create_db_if_not_exists "$WORKFLOWS_DB"

# =============================================================================
# Initialize auth database schema
# =============================================================================
psql -U "$DB_USER" -d "$AUTH_DB" -c "
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";

    -- Create roles table
    CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
    );

    -- Create users table
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar_path TEXT,
        role_id UUID NOT NULL REFERENCES roles(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
    );

    -- Create auth_users table
    CREATE TABLE IF NOT EXISTS auth_users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        last_login TIMESTAMPTZ,
        login_failure_count INTEGER DEFAULT 0,
        is_login_locked BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMPTZ
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
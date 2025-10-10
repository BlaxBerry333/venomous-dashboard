#!/bin/bash

# =============================================================================
# Venomous Dashboard DB - Microservices Database Initialization Script
# =============================================================================
#
# This script initializes PostgreSQL databases for the microservices architecture:
# - auth: Authentication and user management service
# - notes: Note-taking and content management service
# - medias: File upload and medias management service
# - workflows: Business process automation service
# =============================================================================

set -e

# Database connection parameters
DB_USER="venomous_dashboard_db"

# Database names
AUTH_DB="venomous_auth_db"
NOTES_DB="venomous_notes_db"
MEDIA_DB="venomous_medias_db"
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
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
    );

    -- Create users table
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

# =============================================================================
# Initialize notes database schema
# =============================================================================
psql -U "$DB_USER" -d "$NOTES_DB" -c "
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";

    -- =========================================================================
    -- Memos (便签)
    -- =========================================================================
    CREATE TABLE IF NOT EXISTS memos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        content TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT 'yellow',
        is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS idx_memos_user_id ON memos(user_id);
    CREATE INDEX IF NOT EXISTS idx_memos_user_color ON memos(user_id, color);
    CREATE INDEX IF NOT EXISTS idx_memos_pinned ON memos(user_id, is_pinned) WHERE is_pinned = TRUE;
    CREATE INDEX IF NOT EXISTS idx_memos_deleted_at ON memos(deleted_at) WHERE deleted_at IS NOT NULL;

    -- =========================================================================
    -- Articles (长文章/小说)
    -- =========================================================================
    CREATE TABLE IF NOT EXISTS articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        cover_image_url TEXT,
        category TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS article_chapters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        chapter_number INTEGER NOT NULL,
        word_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ,
        CONSTRAINT unique_chapter_number UNIQUE(article_id, chapter_number)
    );

    CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);
    CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
    CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_articles_deleted_at ON articles(deleted_at) WHERE deleted_at IS NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_article_chapters_article_id ON article_chapters(article_id, chapter_number);
    CREATE INDEX IF NOT EXISTS idx_article_chapters_created_at ON article_chapters(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_article_chapters_deleted_at ON article_chapters(deleted_at) WHERE deleted_at IS NOT NULL;
"
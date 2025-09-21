#!/bin/bash

# Django-style database management for Auth Service

set -e

# Service configuration
SERVICE_NAME="auth"
DB_NAME="venomous_auth_db"
DB_USER="venomous_dashboard_db"
CONTAINER_NAME="db"

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"
MODELS_FILE="$SCRIPT_DIR/src/models/database.rs"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}INFO:${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}WARNING:${NC} $1"
}

log_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

# Check if database container is running
check_docker_container() {
    if ! docker ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        log_error "Database container '$CONTAINER_NAME' is not running"
        echo "Please start the database with: make setup SERVICE=db"
        exit 1
    fi
}

# Execute SQL command in container
run_sql() {
    local sql="$1"
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "$sql"
}

# Execute SQL file in container
run_sql_file() {
    local sql_file="$1"
    local filename=$(basename "$sql_file")

    # Copy file to container
    docker cp "$sql_file" "$CONTAINER_NAME:/tmp/$filename"

    # Execute file
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -f "/tmp/$filename"

    # Clean up
    docker exec "$CONTAINER_NAME" rm "/tmp/$filename"
}

# Get list of all migration files
get_all_migrations() {
    if [ -d "$MIGRATIONS_DIR" ]; then
        ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | xargs -I {} basename {} .sql | sort || true
    fi
}

# Get list of applied migrations from database
get_applied_migrations() {
    # Create migration tracking table if it doesn't exist
    run_sql "CREATE TABLE IF NOT EXISTS migration_history (
        migration_name VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
    );" 2>/dev/null || true

    # Get applied migrations from database
    local applied_migrations=$(run_sql "SELECT migration_name FROM migration_history ORDER BY migration_name;" 2>/dev/null | grep -v "migration_name" | grep -v "^-" | grep -v "^(" | grep -v "^$" | tr -d ' ' || true)
    echo "$applied_migrations"
}

# Get next migration number
get_next_migration_number() {
    local migrations=($(get_all_migrations))
    if [ ${#migrations[@]} -eq 0 ]; then
        echo "0001"
        return
    fi

    # Get the last migration and extract number
    local last_migration=""
    for migration in "${migrations[@]}"; do
        last_migration="$migration"
    done

    # Extract just the number part (before the first underscore)
    local last_num=${last_migration%%_*}
    # Convert to number safely
    last_num=$(echo "$last_num" | sed 's/^0*//')
    if [ -z "$last_num" ]; then
        last_num=0
    fi
    local next_num=$((last_num + 1))
    printf "%03d" $next_num
}

# Show migration status (like Django showmigrations)
showmigrations() {
    log_info "Showing migration status for $SERVICE_NAME service..."

    echo ""
    echo "$SERVICE_NAME:"

    local all_migrations=($(get_all_migrations))
    if [ ${#all_migrations[@]} -eq 0 ]; then
        echo " No migrations found"
        echo ""
        return
    fi

    # Get applied migrations
    local applied_migrations_str=$(get_applied_migrations)
    local applied_migrations=()
    if [ -n "$applied_migrations_str" ]; then
        while IFS= read -r line; do
            if [ -n "$line" ]; then
                applied_migrations+=("$line")
            fi
        done <<< "$applied_migrations_str"
    fi

    # Show each migration with status
    for migration in "${all_migrations[@]}"; do
        local is_applied=false
        for applied in "${applied_migrations[@]}"; do
            if [ "$migration" = "$applied" ]; then
                is_applied=true
                break
            fi
        done

        if [ "$is_applied" = true ]; then
            echo " [X] $migration"
        else
            echo " [ ] $migration"
        fi
    done

    echo ""
}

# Create new migration (like Django makemigrations)
makemigrations() {
    local description="$1"
    if [ -z "$description" ]; then
        log_error "Please provide a migration description"
        echo "Usage: $0 makemigrations \"description\""
        echo "Example: $0 makemigrations \"add user preferences table\""
        exit 1
    fi

    # Check if models file exists to validate changes
    if [ ! -f "$MODELS_FILE" ]; then
        log_warn "No models file found at: $MODELS_FILE"
        log_warn "Creating migration anyway, but please ensure this is intentional"
    fi

    # Basic validation: ensure description is not empty
    if [ -z "$description" ]; then
        log_error "Migration description cannot be empty"
        exit 1
    fi

    # Create migrations directory if it doesn't exist
    mkdir -p "$MIGRATIONS_DIR"

    # Generate migration filename
    local migration_num=$(get_next_migration_number)
    local migration_name=$(echo "$description" | tr ' ' '_' | tr '[:upper:]' '[:lower:]' | tr '-' '_')
    local filename="${migration_num}_${migration_name}.sql"
    local filepath="$MIGRATIONS_DIR/$filename"

    # Warn user about manual migration creation
    log_warn "⚠️  Creating migration file: $filename"
    log_warn "⚠️  This creates a template that requires manual SQL editing"
    echo ""
    echo "Important reminders:"
    echo "  1. Edit the generated file to add your actual SQL changes"
    echo "  2. Test your SQL in a development environment first"
    echo "  3. Do not run 'migrate' until the SQL is complete"
    echo ""
    read -p "Continue creating migration template? (Y/n): " -r
    echo

    # Accept empty (Enter), Y, or y as yes; everything else as no
    if [[ -z "$REPLY" || $REPLY =~ ^[Yy]$ ]]; then
        # Continue with migration creation
        :
    else
        log_info "Migration creation cancelled"
        return 0
    fi

    log_info "Creating migration: $filename"

    # Create migration template
    cat > "$filepath" << EOF
-- Migration: ${SERVICE_NAME}.${filename}
-- Service: ${SERVICE_NAME}
-- Description: ${description}
-- Date: $(date +%Y-%m-%d)

\\c ${DB_NAME};

-- TODO: Add your migration SQL here
-- Example:
-- CREATE TABLE IF NOT EXISTS example_table (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     name VARCHAR(255) NOT NULL,
--     created_at TIMESTAMPTZ DEFAULT NOW()
-- );
EOF

    log_info "Migration file created: $filepath"
    log_info "Please edit the file to add your migration SQL"
}

# Apply migrations (like Django migrate)
migrate() {
    log_info "Applying $SERVICE_NAME migrations..."

    if [ ! -d "$MIGRATIONS_DIR" ]; then
        log_warn "No migrations directory found"
        log_warn "Run 'makemigrations' first to create migrations"
        return 1
    fi

    local migration_files=()
    while IFS= read -r -d '' file; do
        migration_files+=("$file")
    done < <(find "$MIGRATIONS_DIR" -name "*.sql" -print0 | sort -z)

    if [ ${#migration_files[@]} -eq 0 ]; then
        log_warn "No migration files found in $MIGRATIONS_DIR"
        log_warn "Run 'makemigrations' first to create migrations"
        return 1
    fi

    # Check if there are any new migrations to apply
    # For now, we'll just warn if the directory seems empty or unchanged
    # In a real implementation, you might track applied migrations differently
    local newest_migration=$(ls -t "$MIGRATIONS_DIR"/*.sql 2>/dev/null | head -1)
    if [ -z "$newest_migration" ]; then
        log_warn "No SQL migration files found"
        return 1
    fi

    # Check if migration files are not empty and contain actual SQL
    local empty_migrations=0
    local template_migrations=0
    for migration_file in "${migration_files[@]}"; do
        if [ ! -s "$migration_file" ]; then
            log_error "Empty migration file found: $(basename "$migration_file")"
            empty_migrations=$((empty_migrations + 1))
        elif grep -q -- "-- TODO: Add your migration SQL here" "$migration_file"; then
            log_error "Template migration file found: $(basename "$migration_file")"
            log_error "Please replace the TODO with actual SQL"
            template_migrations=$((template_migrations + 1))
        fi
    done

    if [ $empty_migrations -gt 0 ]; then
        log_error "Found $empty_migrations empty migration file(s)"
        log_error "Please add SQL content to your migration files before running migrate"
        return 1
    fi

    if [ $template_migrations -gt 0 ]; then
        log_error "Found $template_migrations unedited template migration file(s)"
        log_error "Please edit the migration files and replace TODO comments with actual SQL"
        return 1
    fi

    local applied_count=0
    for migration_file in "${migration_files[@]}"; do
        local filename=$(basename "$migration_file" .sql)
        local filepath=$(basename "$migration_file")

        # Check if migration is already applied
        local applied_migrations_str=$(get_applied_migrations)
        local already_applied=false
        if [ -n "$applied_migrations_str" ]; then
            while IFS= read -r line; do
                if [ "$line" = "$filename" ]; then
                    already_applied=true
                    break
                fi
            done <<< "$applied_migrations_str"
        fi

        if [ "$already_applied" = true ]; then
            log_info "Skipping already applied migration: $filepath"
            continue
        fi

        log_info "Applying migration: $filepath"

        if run_sql_file "$migration_file" 2>/dev/null; then
            # Record migration as applied
            run_sql "INSERT INTO migration_history (migration_name) VALUES ('$filename') ON CONFLICT (migration_name) DO NOTHING;" 2>/dev/null || true
            applied_count=$((applied_count + 1))
        else
            log_error "Failed to apply migration: $filepath"
            break
        fi
    done

    if [ $applied_count -gt 0 ]; then
        log_info "Applied $applied_count migrations successfully!"
    else
        log_info "No migrations were applied"
    fi
}

# Check for model changes (placeholder)
check() {
    log_info "Checking $SERVICE_NAME models for changes..."

    if [ ! -f "$MODELS_FILE" ]; then
        log_warn "No models file found at: $MODELS_FILE"
        return
    fi

    # This is a placeholder - in a real implementation, you'd compare
    # the current model with the last migration
    log_info "Model check completed - no changes detected"
    echo "If you've made model changes, run: $0 makemigrations \"description\""
}

# Show help
show_help() {
    echo "Django-style management for $SERVICE_NAME service"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  showmigrations           - Show migration status"
    echo "  makemigrations \"desc\"    - Create new migration file"
    echo "  migrate                  - Apply migrations"
    echo "  check                    - Check for model changes"
    echo "  help                     - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 makemigrations \"add user preferences table\""
    echo "  $0 showmigrations"
    echo "  $0 migrate"
    echo "  $0 check"
    echo ""
}

# Main script logic
case "${1:-help}" in
    "showmigrations")
        check_docker_container
        showmigrations
        ;;
    "makemigrations")
        makemigrations "$2"
        ;;
    "migrate")
        check_docker_container
        migrate
        ;;
    "check")
        check
        ;;
    "help"|*)
        show_help
        exit 0
        ;;
esac
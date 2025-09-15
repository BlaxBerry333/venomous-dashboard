#!/bin/bash

# Function to create database if it doesn't exist
create_database_if_not_exists() {
    local db_name=$1
    
    echo "Checking if database '$db_name' exists..."
    
    # Check if database exists
    if docker exec db psql -U venomous_dashboard_db -lqt | cut -d \| -f 1 | grep -qw "$db_name"; then
        echo "Database '$db_name' already exists, skipping creation."
    else
        echo "Creating database '$db_name'..."
        docker exec db createdb -U venomous_dashboard_db "$db_name"
        echo "Database '$db_name' created successfully."
    fi
}

echo "Setting up microservice databases..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker exec db pg_isready -U venomous_dashboard_db; do
    echo "PostgreSQL is not ready yet, waiting 2 seconds..."
    sleep 2
done

echo "PostgreSQL is ready, creating databases..."

# Create databases for each microservice
create_database_if_not_exists "venomous_auth_db"
create_database_if_not_exists "venomous_notes_db" 
create_database_if_not_exists "venomous_media_db"
create_database_if_not_exists "venomous_workflows_db"

echo "Database setup completed!"

# List all databases to verify
echo "Current databases:"
docker exec db psql -U venomous_dashboard_db -c "\l"
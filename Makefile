# ====================================================================================================
# Environment Variables
# ====================================================================================================

ENV ?= dev
BASE_PROJECT_NAME = venomous_dashboard
BASE_DOCKER_COMPOSE_FILE_DIR = ./infrastructure/docker

ifeq ($(ENV),dev)
    PROJ_SUFFIX := _dev
    COMPOSE_FILENAME := docker-compose.dev.yml
else ifeq ($(ENV),prod)
    PROJ_SUFFIX :=
    COMPOSE_FILENAME := docker-compose.prod.yml
else
    $(error "Error: Invalid environment $(ENV). Must be 'dev' or 'prod'.")
endif

PROJECT_NAME := $(BASE_PROJECT_NAME)$(PROJ_SUFFIX)
DOCKER_COMPOSE_FILE_PATH := $(BASE_DOCKER_COMPOSE_FILE_DIR)/$(COMPOSE_FILENAME)
DOCKER_COMPOSE_CMD := docker compose -f $(DOCKER_COMPOSE_FILE_PATH) -p $(PROJECT_NAME)


# ====================================================================================================
# Helper Functions
# ====================================================================================================

check_service = $(if $(strip $(SERVICE)),,$(error "Error: You must specify a service. Usage: make <target> SERVICE=<service_name>"))
resolve_service = $(SERVICE)

define call_db_command
	@SERVICE_PATH="./services/$(call resolve_service)"; \
	if [ -f "$$SERVICE_PATH/manage.py" ]; then \
		echo "Detected Django project, using Django commands..."; \
		if [ "$(1)" = "makemigrations" ] && [ -n "$(2)" ]; then \
			echo "Note: Django makemigrations doesn't use description parameter"; \
			cd "$$SERVICE_PATH" && python manage.py $(1); \
		else \
			cd "$$SERVICE_PATH" && python manage.py $(1) $(2); \
		fi; \
	elif [ -f "$$SERVICE_PATH/manage.sh" ]; then \
		echo "Using custom manage script..."; \
		$$SERVICE_PATH/manage.sh $(1) $(2); \
	else \
		echo "Error: No manage.py or manage.sh found in $$SERVICE_PATH"; \
		exit 1; \
	fi
endef


# ====================================================================================================
# COMMON COMMANDS
# ====================================================================================================

.DEFAULT_GOAL := help
.PHONY: help list-services
.PHONY: build-all build setup-all setup stop-all stop clean-all clean enter logs-all logs status-all status
.PHONY: db-init db-showmigrations db-makemigrations db-migrate db-check


help:
	@echo ""
	@echo "Venomous Dashboard Project Commands"
	@echo "=================================="
	@echo ""
	@echo "Common Commands:"
	@echo "  help               Show this help message"
	@echo "  show-services      Show all available service names"
	@echo ""
	@echo "All Services Management:"
	@echo "  setup-all          Build and start all services"
	@echo "  build-all          Build all service images"
	@echo "  stop-all           Stop all services"
	@echo "  clean-all          Stop and remove all containers, networks, volumes, and images"
	@echo "  logs-all           Show logs of all services"
	@echo "  status-all         Show status of all services"
	@echo ""
	@echo "A Specific Service Management (SERVICE=service_name):"
	@echo "  setup              Build and start a specific service"
	@echo "  build              Build a specific service image"
	@echo "  stop               Stop a specific service"
	@echo "  clean              Stop and remove a specific service's container"
	@echo "  logs               Show logs of a specific service"
	@echo "  status             Show status of a specific service"
	@echo "  enter              Enter a running service container"
	@echo ""
	@echo "Database Management:"
	@echo "  db-init            Initialize fresh database (Docker auto-run)"
	@echo ""
	@echo "A Specific Service Database Management (SERVICE=service_name):"
	@echo "  db-showmigrations  Show migration status"
	@echo "  db-makemigrations  Create new migration (DESC=\"description\" for non-Django)"
	@echo "  db-migrate         Apply migrations"
	@echo "  db-check           Check models for changes"
	@echo ""
	@echo "Examples:"
	@echo "  make setup SERVICE=dashboard"
	@echo "  make db-showmigrations SERVICE=auth"
	@echo "  make db-makemigrations SERVICE=auth DESC=\"add user preferences\""
	@echo ""
	@echo ""


# ====================================================================================================
# ALL SERVICES MANAGEMENT
# ====================================================================================================


show-services:
	@echo "Available service names:"
	@echo ""
	@$(DOCKER_COMPOSE_CMD) config --services | column -t
	@echo ""

setup-all:
	@echo "Building and starting all services..."
	@$(DOCKER_COMPOSE_CMD) up --build -d

build-all:
	@echo "Building all service images..."
	@$(DOCKER_COMPOSE_CMD) build

stop-all:
	@echo "Stopping all services..."
	@$(DOCKER_COMPOSE_CMD) stop

clean-all:
	@echo "Cleaning up all services..."
	@$(DOCKER_COMPOSE_CMD) down --volumes --remove-orphans --rmi all
	@for service in $$($(DOCKER_COMPOSE_CMD) config --services 2>/dev/null || echo ""); do \
		if [ -n "$$service" ]; then \
			docker stop "$$service" 2>/dev/null || true; \
			docker rm "$$service" 2>/dev/null || true; \
		fi; \
	done
	@docker stop $$(docker ps -aq) 2>/dev/null || true
	@docker rm $$(docker ps -aq) 2>/dev/null || true
	@docker rmi $$(docker images "$(PROJECT_NAME)-*" -q) 2>/dev/null || true
	@docker system prune -f

logs-all:
	@echo "Showing logs for all services..."
	@$(DOCKER_COMPOSE_CMD) logs -f

status-all:
	@echo "Showing status for all services..."
	@$(DOCKER_COMPOSE_CMD) ps


# ====================================================================================================
# A SPECIFIC SERVICE MANAGEMENT
# ====================================================================================================


setup:
	$(check_service)
	@echo "Building and starting $(SERVICE)..."
	@$(DOCKER_COMPOSE_CMD) up --build -d $(SERVICE)

build:
	$(check_service)
	@echo "Building $(SERVICE)..."
	@$(DOCKER_COMPOSE_CMD) build $(SERVICE)

stop:
	$(check_service)
	@echo "Stopping $(SERVICE)..."
	@$(DOCKER_COMPOSE_CMD) stop $(SERVICE)

clean:
	$(check_service)
	@echo "Cleaning up $(SERVICE)..."
	@$(DOCKER_COMPOSE_CMD) rm -f -v $(SERVICE)

logs:
	$(check_service)
	@echo "Showing logs for $(SERVICE)..."
	@$(DOCKER_COMPOSE_CMD) logs -f $(SERVICE)

status:
	$(check_service)
	@echo "Showing status for $(SERVICE)..."
	@$(DOCKER_COMPOSE_CMD) ps $(SERVICE)

enter:
	$(check_service)
	@echo "Entering container for $(SERVICE)..."
	@$(DOCKER_COMPOSE_CMD) exec $(SERVICE) /bin/sh


# ====================================================================================================
# DATABASE MANAGEMENT
# ====================================================================================================


db-init:
	@echo "Database initialization is handled by Docker init script:"
	@echo "  infrastructure/database/db-init.sh"
	@echo ""
	@echo "This runs automatically when the database container is first created."
	@echo "To manually reinitialize, reset the database volume and restart the db service."

# ====================================================================================================
# A SPECIFIC SERVICE DATABASE MANAGEMENT
# ====================================================================================================

db-showmigrations:
	$(check_service)
	$(call call_db_command,showmigrations)

db-makemigrations:
	$(check_service)
	@SERVICE_PATH="./services/$(call resolve_service)"; \
	if [ -f "$$SERVICE_PATH/manage.py" ]; then \
		echo "Detected Django project, running makemigrations..."; \
		cd "$$SERVICE_PATH" && python manage.py makemigrations; \
	else \
		if [ -z "$(DESC)" ]; then \
			echo "No description provided, using default: 'migration_$(shell date +%Y%m%d_%H%M%S)'"; \
			$$SERVICE_PATH/manage.sh makemigrations "migration_$(shell date +%Y%m%d_%H%M%S)"; \
		else \
			$$SERVICE_PATH/manage.sh makemigrations "$(DESC)"; \
		fi; \
	fi

db-migrate:
	$(check_service)
	$(call call_db_command,migrate)

db-check:
	$(check_service)
	$(call call_db_command,check)
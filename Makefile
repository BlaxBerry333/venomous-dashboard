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

# If SERVICE is not empty, this variable is empty. If SERVICE is empty, it expands to the error message.
check_service = $(if $(strip $(SERVICE)),,$(error "Error: You must specify a service. Usage: make <target> SERVICE=<service_name>"))

.DEFAULT_GOAL := help

.PHONY: build-all build setup-all setup stop-all stop clean-all clean enter logs-all logs help list-services status-all status

# ====================================================================================================
# Show all available commands
# ====================================================================================================
help:
	@echo ""
	@echo "Usage: make <command> [SERVICE=...]"
	@echo ""
	@echo "Commands for All Services:"
	@echo "Usage: make <command>"
	@echo "  list-services      List all available service names."
	@echo "  setup-all          Build and start all services."
	@echo "  build-all          Build all service images but don't start."
	@echo "  stop-all           Stop all services."
	@echo "  clean-all          Stop and remove all containers, networks, volumes, and images."
	@echo "  logs-all           Show logs of all services."
	@echo "  status-all         Show status of all services containers."
	@echo ""
	@echo "Commands for a Specific Service:"
	@echo "Usage: make <command> SERVICE=<name>"
	@echo "  setup              Build and start a specific service."
	@echo "  build              Build a specific service image but don't start."
	@echo "  stop               Stop a specific service."
	@echo "  clean              Stop and remove a specific service's container and anonymous volumes."
	@echo "  logs               Show logs of a specific service."
	@echo "  status             Show status of a specific service container."
	@echo "  enter              Enter a running service container."
	@echo ""

# ====================================================================================================
# List all available service names.
# ====================================================================================================
list-services:
	@echo "Available services names for make <command>:"
	@echo ""
	@$(DOCKER_COMPOSE_CMD) config --services | column -t


# ====================================================================================================
# Build and start all services.
# ====================================================================================================
setup-all:
	@echo "Starting all services..."
	@$(DOCKER_COMPOSE_CMD) up -d --build


# ====================================================================================================
# Build and start a specific service.
# ====================================================================================================
setup:
	$(check_service)
	@echo "Starting $(SERVICE)..."
	@$(DOCKER_COMPOSE_CMD) up -d --build $(SERVICE)


# ====================================================================================================
# Build all service images but don't start.
# ====================================================================================================
build-all:
	@echo "Building all service images..."
	@$(DOCKER_COMPOSE_CMD) build


# ====================================================================================================
# Build a specific service image but don't start.
# ====================================================================================================
build:
	$(check_service)
	@echo "Building image for $(SERVICE)..."
	@$(DOCKER_COMPOSE_CMD) build $(SERVICE)


# ====================================================================================================
# Stop all services.
# ====================================================================================================
stop-all:
	@echo "Stopping all services..."
	@$(DOCKER_COMPOSE_CMD) stop


# ====================================================================================================
# Stop a specific service.
# ====================================================================================================
stop:
	$(check_service)
	@echo "Stopping $(SERVICE)..."
	@$(DOCKER_COMPOSE_CMD) stop $(SERVICE)


# ====================================================================================================
# Stop and remove all containers, networks, volumes, and images.
# ====================================================================================================
clean-all:
	@echo "Cleaning up entire environment..."
	@$(DOCKER_COMPOSE_CMD) down -v --rmi all


# ====================================================================================================
# Stop and remove a specific service's container and anonymous volumes.
# ====================================================================================================
clean:
	$(check_service)
	@echo "Cleaning up $(SERVICE)..."
	@$(DOCKER_COMPOSE_CMD) rm -s -v -f $(SERVICE)


# ====================================================================================================
# Show logs of all services.
# ====================================================================================================
logs-all:
	@echo "Show logs for all services..."
	@$(DOCKER_COMPOSE_CMD) logs -f --tail="100"


# ====================================================================================================
# Show logs of a specific service.
# ====================================================================================================
logs:
	$(check_service)
	@echo "Show logs for $(SERVICE)..."
	@$(DOCKER_COMPOSE_CMD) logs -f --tail="100" $(SERVICE)


# ====================================================================================================
# Show status of all services containers.
# ====================================================================================================
status-all:
	@echo "Showing status for all services..."
	@$(DOCKER_COMPOSE_CMD) ps --services --all
	@echo ""
	@$(DOCKER_COMPOSE_CMD) ps --all | column -t


# ====================================================================================================
# Show status of a specific service container.
# ====================================================================================================
status:
	$(check_service)
	@echo "Showing status for $(SERVICE)..."
	@$(DOCKER_COMPOSE_CMD) ps $(SERVICE) --all | column -t


# ====================================================================================================
# Enter a running service container
# ====================================================================================================
enter:
	$(check_service)
	@echo "Entering container for $(SERVICE)..."
	@$(DOCKER_COMPOSE_CMD) exec $(SERVICE) /bin/sh

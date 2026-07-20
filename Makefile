.PHONY: help build up up-build down logs logs-follow logs-all restart clean deploy docker-deploy git-pull

# Auto-detect docker compose command (v2 plugin vs v1 standalone)
DOCKER_COMPOSE := $(shell if docker compose version >/dev/null 2>&1; then echo "docker compose"; else echo "docker-compose"; fi)
CONTAINER_NAME := sla-frontend
PORT := 9202

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

build: ## Build the Docker image
	$(DOCKER_COMPOSE) build --no-cache

up: ## Start the Docker container in detached mode
	$(DOCKER_COMPOSE) up -d

up-build: ## Build and start the Docker container
	$(DOCKER_COMPOSE) up -d --build

down: ## Stop and remove the Docker container
	$(DOCKER_COMPOSE) down

logs: ## Show last 50 lines of logs (non-blocking)
	$(DOCKER_COMPOSE) logs --tail=50

logs-follow: ## Follow logs in real-time (Ctrl+C to stop)
	$(DOCKER_COMPOSE) logs -f

logs-all: ## Show all logs
	$(DOCKER_COMPOSE) logs

restart: ## Restart the Docker container
	$(DOCKER_COMPOSE) restart

clean: ## Stop and remove containers, images, and volumes
	$(DOCKER_COMPOSE) down -v --rmi all

git-pull: ## Pull the latest code from origin/main
	git pull origin main

deploy: git-pull down up-build ## Full deploy: pull latest code, stop/remove old container, rebuild and restart
	@echo "Deployment complete. Site running on http://localhost:$(PORT)"

docker-deploy: down up-build ## Build and restart container without git pull
	@echo "Docker deployment complete. Site running on http://localhost:$(PORT)"

status: ## Show container status
	$(DOCKER_COMPOSE) ps

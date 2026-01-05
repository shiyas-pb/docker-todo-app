# Docker Todo App Makefile

.PHONY: help build up up-dev down logs clean test restart ps shell db-shell health prod-up prod-down backup restore

help:
	@echo "Docker Todo App Management Commands:"
	@echo ""
	@echo "  make build     - Build all Docker images"
	@echo "  make up        - Start all containers (detached)"
	@echo "  make up-dev    - Start dev containers with logs"
	@echo "  make down      - Stop and remove all containers"
	@echo "  make logs      - View container logs"
	@echo "  make clean     - Remove containers, images, and volumes"
	@echo "  make test      - Run tests"
	@echo "  make restart   - Restart all containers"
	@echo "  make ps        - Show running containers"
	@echo "  make shell     - Open shell in backend container"
	@echo "  make db-shell  - Open PostgreSQL shell"
	@echo "  make health    - Check health of all services"
	@echo ""

build:
	@echo "Building Docker images..."
	docker compose build

up:
	@echo "Starting containers..."
	docker compose up -d
	@echo "Containers started!"
	@echo "Frontend: http://localhost:8080"
	@echo "Backend API: http://localhost:3000"
	@echo "pgAdmin: http://localhost:5050 (admin@todoapp.com/admin123)"

up-dev:
	@echo "Starting containers with logs..."
	docker compose up

down:
	@echo "Stopping containers..."
	docker compose down

logs:
	docker compose logs -f

clean:
	@echo "Cleaning up..."
	docker compose down -v --rmi all
	@echo "Cleanup complete!"

test:
	@echo "Running tests..."
	docker compose exec backend npm test

restart:
	@echo "Restarting containers..."
	docker compose restart

ps:
	docker compose ps

shell:
	docker compose exec backend sh

db-shell:
	docker compose exec postgres psql -U todo_user -d todoapp

health:
	@echo "Checking service health..."
	@echo "Frontend:"
	@curl -s http://localhost:8080/health | python3 -m json.tool || echo "Frontend not responding"
	@echo ""
	@echo "Backend:"
	@curl -s http://localhost:3000/health | python3 -m json.tool || echo "Backend not responding"
	@echo ""
	@echo "PostgreSQL:"
	@docker compose exec postgres pg_isready -U todo_user -d todoapp && echo "PostgreSQL is ready" || echo "PostgreSQL not ready"

prod-up:
	@echo "Starting production containers..."
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

prod-down:
	@echo "Stopping production containers..."
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down

backup:
	@echo "Backing up database..."
	@mkdir -p backups
	docker compose exec postgres pg_dump -U todo_user todoapp > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup saved to backups/"

restore:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make restore FILE=backup_file.sql"; \
		exit 1; \
	fi
	docker compose exec -T postgres psql -U todo_user -d todoapp < $(FILE)
	@echo "Database restored from $(FILE)"


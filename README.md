# Dockerized To-Do Application

A complete, production-ready To-Do application built with Docker, Docker Compose, Node.js, PostgreSQL, and Nginx.

## 🚀 Features

- **Multi-container Docker setup** with separate services
- **Docker Compose** for local development and production
- **Health checks** for all containers
- **Production-ready** configuration
- **PostgreSQL** database with initialization
- **Nginx** reverse proxy for frontend
- **Node.js/Express** backend API
- **Makefile** for easy management

## 📁 Project Structure
```bash
docker-todo-app/
├── frontend/ # Nginx serving static files
├── backend/ # Node.js API
├── database/ # PostgreSQL initialization
├── docker-compose.yml # Development configuration
├── docker-compose.prod.yml # Production configuration
├── Makefile # Management commands
└── README.md # Complete Info about the project
```

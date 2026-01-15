#!/bin/bash

# RecruitHub Quick Start Script
# This script helps you quickly set up and run RecruitHub

set -e

COLOR_GREEN='\033[0;32m'
COLOR_BLUE='\033[0;34m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'
COLOR_NC='\033[0m' # No Color

echo -e "${COLOR_BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║              RecruitHub Quick Start Script               ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${COLOR_NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${COLOR_YELLOW}Checking prerequisites...${COLOR_NC}"

if ! command_exists docker; then
    echo -e "${COLOR_RED}✗ Docker is not installed. Please install Docker first.${COLOR_NC}"
    exit 1
fi
echo -e "${COLOR_GREEN}✓ Docker is installed${COLOR_NC}"

if ! command_exists docker-compose; then
    echo -e "${COLOR_RED}✗ Docker Compose is not installed. Please install Docker Compose first.${COLOR_NC}"
    exit 1
fi
echo -e "${COLOR_GREEN}✓ Docker Compose is installed${COLOR_NC}"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "\n${COLOR_YELLOW}Creating .env file from template...${COLOR_NC}"
    cp .env.example .env
    echo -e "${COLOR_GREEN}✓ .env file created${COLOR_NC}"
    echo -e "${COLOR_YELLOW}⚠ Please edit .env file with your configuration before running in production${COLOR_NC}"
fi

# Create backend .env if it doesn't exist
if [ ! -f backend/.env ]; then
    echo -e "${COLOR_YELLOW}Creating backend/.env file...${COLOR_NC}"
    cat > backend/.env << EOF
MONGO_URL="mongodb://admin:changeme123@mongodb:27017/"
DB_NAME="recruitment_db"
CORS_ORIGINS="*"
JWT_SECRET="your-secret-key-change-in-production-min-32-chars"
EOF
    echo -e "${COLOR_GREEN}✓ backend/.env file created${COLOR_NC}"
fi

# Create frontend .env if it doesn't exist
if [ ! -f frontend/.env ]; then
    echo -e "${COLOR_YELLOW}Creating frontend/.env file...${COLOR_NC}"
    cat > frontend/.env << EOF
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
EOF
    echo -e "${COLOR_GREEN}✓ frontend/.env file created${COLOR_NC}"
fi

echo -e "\n${COLOR_BLUE}Starting RecruitHub services...${COLOR_NC}"

# Stop any existing containers
docker-compose down 2>/dev/null || true

# Start services
echo -e "${COLOR_YELLOW}Building and starting containers...${COLOR_NC}"
docker-compose up -d --build

# Wait for services to be healthy
echo -e "\n${COLOR_YELLOW}Waiting for services to be ready...${COLOR_NC}"
sleep 10

# Check service status
echo -e "\n${COLOR_BLUE}Service Status:${COLOR_NC}"
docker-compose ps

# Check if backend is responding
echo -e "\n${COLOR_YELLOW}Checking backend health...${COLOR_NC}"
for i in {1..30}; do
    if curl -s http://localhost:8001/api/ > /dev/null 2>&1; then
        echo -e "${COLOR_GREEN}✓ Backend is healthy${COLOR_NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${COLOR_RED}✗ Backend health check failed${COLOR_NC}"
        echo -e "${COLOR_YELLOW}Check logs with: docker-compose logs backend${COLOR_NC}"
    fi
    sleep 2
done

# Check if frontend is responding
echo -e "${COLOR_YELLOW}Checking frontend health...${COLOR_NC}"
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${COLOR_GREEN}✓ Frontend is healthy${COLOR_NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${COLOR_RED}✗ Frontend health check failed${COLOR_NC}"
        echo -e "${COLOR_YELLOW}Check logs with: docker-compose logs frontend${COLOR_NC}"
    fi
    sleep 2
done

echo -e "\n${COLOR_GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║              🎉 RecruitHub is now running! 🎉             ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${COLOR_NC}"

echo -e "\n${COLOR_BLUE}Access the application:${COLOR_NC}"
echo -e "  Frontend:  ${COLOR_GREEN}http://localhost:3000${COLOR_NC}"
echo -e "  Backend:   ${COLOR_GREEN}http://localhost:8001/api/${COLOR_NC}"
echo -e "  API Docs:  ${COLOR_GREEN}http://localhost:8001/docs${COLOR_NC}"
echo -e "  MongoDB:   ${COLOR_GREEN}localhost:27017${COLOR_NC}"

echo -e "\n${COLOR_BLUE}Default Login Credentials:${COLOR_NC}"
echo -e "  Email:     ${COLOR_GREEN}admin@recruitment.com${COLOR_NC}"
echo -e "  Password:  ${COLOR_GREEN}Admin@123${COLOR_NC}"
echo -e "  ${COLOR_RED}⚠ Change these credentials in production!${COLOR_NC}"

echo -e "\n${COLOR_BLUE}Useful Commands:${COLOR_NC}"
echo -e "  View logs:         ${COLOR_YELLOW}docker-compose logs -f${COLOR_NC}"
echo -e "  Stop services:     ${COLOR_YELLOW}docker-compose down${COLOR_NC}"
echo -e "  Restart services:  ${COLOR_YELLOW}docker-compose restart${COLOR_NC}"
echo -e "  View status:       ${COLOR_YELLOW}docker-compose ps${COLOR_NC}"

echo -e "\n${COLOR_YELLOW}For production deployment, see DEPLOYMENT.md${COLOR_NC}\n"
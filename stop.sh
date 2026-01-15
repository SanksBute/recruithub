#!/bin/bash

# RecruitHub Stop Script

set -e

COLOR_BLUE='\033[0;34m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_NC='\033[0m'

echo -e "${COLOR_BLUE}Stopping RecruitHub services...${COLOR_NC}"

docker-compose down

echo -e "${COLOR_GREEN}✓ All services stopped${COLOR_NC}"

echo -e "\n${COLOR_YELLOW}To start again, run: ./start.sh${COLOR_NC}"
echo -e "${COLOR_YELLOW}To remove volumes (delete data): docker-compose down -v${COLOR_NC}\n"
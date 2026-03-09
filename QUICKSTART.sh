#!/bin/bash

# NurseryTrack Quick Start Script
# This script helps you get started with NurseryTrack development or deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════╗"
echo "║                                                    ║"
echo "║        🌱 Welcome to NurseryTrack! 🌱             ║"
echo "║                                                    ║"
echo "║   Open Source Self-Hosted Nursery Management      ║"
echo "║                                                    ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Function to print section headers
print_header() {
    echo -e "${BLUE}➜ $1${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    local missing_tools=()

    # Check Git
    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    else
        print_success "Git found"
    fi

    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_tools+=("node.js")
    else
        NODE_VERSION=$(node --version)
        print_success "Node.js found ($NODE_VERSION)"
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    else
        NPM_VERSION=$(npm --version)
        print_success "npm found ($NPM_VERSION)"
    fi

    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker found ($DOCKER_VERSION)"
        DOCKER_INSTALLED=true
    else
        print_warning "Docker not found (optional for development)"
        DOCKER_INSTALLED=false
    fi

    if [ ${#missing_tools[@]} -ne 0 ]; then
        echo ""
        print_error "Missing required tools: ${missing_tools[*]}"
        echo -e "${YELLOW}Please install the missing tools and try again${NC}"
        exit 1
    fi

    echo ""
}

# Setup environment files
setup_env_files() {
    print_header "Setting Up Environment Files"

    if [ ! -f .env ]; then
        print_warning ".env file not found, creating from .env.example"
        cp .env.example .env
        print_success "Created .env file"
    else
        print_success ".env file already exists"
    fi

    if [ ! -f backend/.env ]; then
        print_warning "backend/.env file not found, creating from backend/.env.example"
        cp backend/.env.example backend/.env
        print_success "Created backend/.env file"
    else
        print_success "backend/.env file already exists"
    fi

    echo ""
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"

    print_warning "Installing frontend dependencies..."
    npm install > /dev/null 2>&1
    print_success "Frontend dependencies installed"

    print_warning "Installing backend dependencies..."
    cd backend
    npm install > /dev/null 2>&1
    cd ..
    print_success "Backend dependencies installed"

    echo ""
}

# Start Docker services
start_docker_services() {
    if [ "$DOCKER_INSTALLED" = false ]; then
        print_warning "Skipping Docker services (Docker not installed)"
        echo ""
        return
    fi

    print_header "Starting Docker Services"

    # Check if docker-compose is available
    if ! command -v docker-compose &> /dev/null; then
        print_warning "docker-compose not found, skipping Docker setup"
        echo ""
        return
    fi

    print_warning "Starting services (this may take a moment)..."

    # Check if services are already running
    if docker-compose ps | grep -q "nurserytrack"; then
        print_success "Docker services already running"
    else
        docker-compose up -d > /dev/null 2>&1

        # Wait for services to be healthy
        echo "Waiting for services to be ready..."
        sleep 10

        print_success "Docker services started"
    fi

    # Show service status
    echo -e "\n${BLUE}Service Status:${NC}"
    docker-compose ps

    echo ""
}

# Run database migrations
run_migrations() {
    if [ "$DOCKER_INSTALLED" = false ]; then
        print_warning "Skipping database migrations (Docker not installed)"
        echo ""
        return
    fi

    print_header "Running Database Migrations"

    if docker-compose ps | grep -q "nurserytrack-api"; then
        print_warning "Running migrations..."
        docker-compose exec -T api npm run migrate > /dev/null 2>&1
        print_success "Database migrations completed"
    else
        print_warning "API service not running, skipping migrations"
    fi

    echo ""
}

# Create admin user
create_admin_user() {
    if [ "$DOCKER_INSTALLED" = false ]; then
        print_warning "Skipping admin user creation (Docker not installed)"
        echo ""
        return
    fi

    print_header "Creating Admin User"

    if docker-compose ps | grep -q "nurserytrack-api"; then
        print_warning "Creating default admin user..."

        docker-compose exec -T api node -e "
const pool = require('./src/db/connection');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

(async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (id, email, password_hash, name, role) VALUES (\$1, \$2, \$3, \$4, \$5)',
      [uuidv4(), 'admin@nurserytrack.local', hashedPassword, 'Admin', 'admin']
    );
    console.log('✓ Admin user created successfully!');
    console.log('  Email: admin@nurserytrack.local');
    console.log('  Password: admin123');
    console.log('  NOTE: Change the password after first login!');
  } catch (error) {
    if (error.message.includes('duplicate key')) {
      console.log('⚠ Admin user already exists');
    } else {
      console.error('Error creating admin user:', error.message);
    }
  }
  process.exit(0);
})();
" 2>/dev/null || true
    else
        print_warning "API service not running, skipping admin user creation"
    fi

    echo ""
}

# Show available commands
show_commands() {
    print_header "Available Commands"

    echo -e "${BLUE}Frontend:${NC}"
    echo "  npm start              - Start Expo development server"
    echo "  npm run android        - Run on Android emulator"
    echo "  npm run ios            - Run on iOS simulator"
    echo "  npm run web            - Run in web browser"

    echo ""
    echo -e "${BLUE}Backend:${NC}"
    echo "  cd backend && npm run dev     - Start backend development server"
    echo "  cd backend && npm run migrate - Run database migrations"

    echo ""
    echo -e "${BLUE}Docker:${NC}"
    echo "  docker-compose up -d   - Start all services"
    echo "  docker-compose down    - Stop all services"
    echo "  docker-compose logs -f - View service logs"
    echo "  docker-compose ps      - Show service status"

    echo ""
    echo -e "${BLUE}Documentation:${NC}"
    echo "  cat README.md          - Main documentation"
    echo "  cat DEPLOYMENT.md      - Deployment guide"
    echo "  cat CONTRIBUTING.md    - Contributing guide"

    echo ""
}

# Show access information
show_access_info() {
    if [ "$DOCKER_INSTALLED" = true ]; then
        print_header "Access Services"

        echo -e "${BLUE}Backend API:${NC}"
        echo "  URL: http://localhost:3000/api"
        echo "  Health: http://localhost:3000/api/health"

        echo ""
        echo -e "${BLUE}MinIO (Object Storage):${NC}"
        echo "  URL: http://localhost:9001"
        echo "  Default: minioadmin / minioadmin"

        echo ""
        echo -e "${BLUE}pgAdmin (Database Management):${NC}"
        echo "  URL: http://localhost:5050"
        echo "  Email: admin@nurserytrack.local"
        echo "  Password: admin"

        echo ""
    fi
}

# Main flow
main() {
    check_prerequisites
    setup_env_files
    install_dependencies

    echo ""
    read -p "Do you want to start Docker services? (y/n) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_docker_services
        run_migrations
        create_admin_user
        show_access_info
    fi

    echo ""
    show_commands

    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ Setup complete! Ready to start developing 🚀${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Start the backend:  cd backend && npm run dev"
    echo "  2. In another terminal, start the frontend: npm start"
    echo "  3. Open the Expo menu to run on your device"

    echo ""
    echo -e "${BLUE}Need help?${NC}"
    echo "  • Check README.md for full documentation"
    echo "  • See DEPLOYMENT.md for production setup"
    echo "  • Read CONTRIBUTING.md if you want to contribute"

    echo ""
}

# Run main function
main

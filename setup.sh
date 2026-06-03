#!/bin/bash

# AYUSHRATNA - Automated Local Setup Script
# This script sets up the complete development environment

set -e  # Exit on error

echo "🌿 AYUSHRATNA - Ayurvedic E-Commerce Platform Setup"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
print_info "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js $NODE_VERSION detected"

# Check if PostgreSQL is installed
print_info "Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL not found. You can:"
    echo "  1. Install locally: https://www.postgresql.org/download/"
    echo "  2. Use cloud provider (Neon, Supabase, etc.)"
    echo ""
    read -p "Do you want to continue with cloud database setup? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    PG_VERSION=$(psql --version)
    print_success "PostgreSQL detected: $PG_VERSION"
fi

# Install dependencies
print_info "Installing npm dependencies..."
npm install
print_success "Dependencies installed"

# Check if .env file exists
if [ ! -f .env ]; then
    print_info "Creating .env file from template..."
    cp .env.example .env
    print_warning ".env file created. Please configure DATABASE_URL and JWT_SECRET"
    echo ""
    echo "To configure:"
    echo "  1. Open .env in your editor"
    echo "  2. Set DATABASE_URL to your PostgreSQL connection string"
    echo "  3. Generate JWT_SECRET with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    echo ""
    read -p "Press Enter when .env is configured..."
else
    print_success ".env file already exists"
fi

# Verify DATABASE_URL is set
if grep -q "DATABASE_URL=" .env && ! grep -q "DATABASE_URL=postgresql://user:password" .env; then
    print_success "DATABASE_URL is configured"
else
    print_error "DATABASE_URL not configured in .env file"
    print_info "Example: DATABASE_URL=postgresql://username:password@localhost:5432/ayushratna_db"
    exit 1
fi

# Verify JWT_SECRET is set
if grep -q "JWT_SECRET=" .env && ! grep -q "JWT_SECRET=your-super-secure" .env; then
    print_success "JWT_SECRET is configured"
else
    print_warning "JWT_SECRET not configured. Generating one..."
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
    else
        # Linux
        sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
    fi
    print_success "JWT_SECRET generated and saved"
fi

# Push database schema
print_info "Setting up database schema..."
if npm run db:push; then
    print_success "Database schema created"
else
    print_warning "db:push failed, trying force push..."
    if npm run db:push -- --force; then
        print_success "Database schema created (forced)"
    else
        print_error "Failed to create database schema"
        print_info "Please check your DATABASE_URL and database connection"
        exit 1
    fi
fi

# Seed database
print_info "Seeding database with sample data..."
if npm run db:seed; then
    print_success "Database seeded with 32 Ayurvedic products and admin user"
else
    print_warning "Database seeding failed (might already be seeded)"
fi

echo ""
echo "=================================================="
print_success "Setup Complete! 🎉"
echo "=================================================="
echo ""
print_info "Admin Credentials:"
echo "  📧 Email: admin@ayushratna.com"
echo "  🔑 Password: admin123"
echo "  ⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!"
echo ""
print_info "To start development server:"
echo "  npm run dev"
echo ""
print_info "Then open:"
echo "  🌐 Frontend: http://localhost:5000"
echo "  🔧 Admin Panel: http://localhost:5000/admin/login"
echo "  📊 API: http://localhost:5000/api/products"
echo ""
print_success "Happy coding! 🌿✨"

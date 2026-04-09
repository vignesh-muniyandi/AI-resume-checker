#!/bin/bash

# AI Resume Analyzer - Startup Script
# This script helps set up and run the application
# Works on macOS and Linux

echo "🤖 AI Resume Analyzer - Startup Script"
echo "======================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "❌ Frontend directory not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "📁 Project structure verified"
echo ""

# Backend setup
echo "🔧 Setting up backend..."
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env and add your OPENAI_API_KEY"
    echo "   Get key from: https://platform.openai.com/api-keys"
else
    echo "✅ .env file exists"
fi

# Check if OPENAI_API_KEY is set
if ! grep -q "sk-" .env; then
    echo "⚠️  WARNING: OPENAI_API_KEY not configured in backend/.env"
    echo "   Backend will not work without it"
fi

cd ..

echo "✅ Backend setup complete"
echo ""

# Frontend setup
echo "🎨 Setting up frontend..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

cd ..

echo "✅ Frontend setup complete"
echo ""

# Final instructions
echo "========================================="
echo "🎉 Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Edit backend/.env and add OPENAI_API_KEY"
echo ""
echo "2. In Terminal 1, start the backend:"
echo "   cd backend && npm run dev"
echo ""
echo "3. In Terminal 2, start the frontend:"
echo "   cd frontend && npm start"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "For help, see QUICK_START.md or README.md"
echo ""

#!/bin/bash

echo "🏸 Badminton Manager - Vercel Deployment Script"
echo "================================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "npm install -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ You are not logged in to Vercel. Please login first:"
    echo "vercel login"
    exit 1
fi

echo "✅ Vercel CLI is ready"

# Deploy Backend
echo ""
echo "🚀 Step 1: Deploying Backend Server..."
echo "======================================"

cd server

echo "📦 Installing backend dependencies..."
npm install

echo "🌐 Deploying backend to Vercel..."
echo "When prompted, choose:"
echo "- Project name: badminton-backend (or your preferred name)"
echo "- Directory: ./ (current directory)"
echo "- Override settings: No"
echo ""
vercel --prod

echo "✅ Backend deployed successfully!"

cd ..

# Deploy Frontend
echo ""
echo "🚀 Step 2: Deploying Frontend..."
echo "================================="

echo "📦 Installing frontend dependencies..."
npm install

echo "🌐 Deploying frontend to Vercel..."
echo "When prompted, choose:"
echo "- Project name: badminton-frontend (or your preferred name)"
echo "- Directory: ./ (current directory)"
echo "- Override settings: No"
echo ""
vercel --prod

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "📋 Next Steps:"
echo "1. Go to your Vercel dashboard: https://vercel.com/dashboard"
echo "2. You should see two projects: badminton-backend and badminton-frontend"
echo ""
echo "3. Set environment variables:"
echo "   BACKEND PROJECT:"
echo "   - MONGODB_URI = your_mongodb_connection_string"
echo ""
echo "   FRONTEND PROJECT:"
echo "   - VITE_API_URL = https://your-backend-project.vercel.app/api"
echo ""
echo "4. Test your application at your frontend URL"
echo ""
echo "5. If you encounter CORS issues, update your backend CORS settings"
echo "   to include your frontend domain" 

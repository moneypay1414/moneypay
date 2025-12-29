#!/bin/bash

echo "🚀 MoneyPay Deployment Script"
echo "============================="

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the root directory of the project"
    exit 1
fi

echo "📦 Building frontend..."
cd frontend
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend built successfully"

echo ""
echo "📋 Next steps:"
echo "1. Deploy your backend to Railway, Render, or Heroku"
echo "2. Get your backend API URL"
echo "3. Set VITE_API_URL environment variable in Vercel"
echo "4. Deploy frontend to Vercel:"
echo "   cd frontend"
echo "   vercel --prod"
echo ""
echo "📚 Check README.md for detailed deployment instructions"
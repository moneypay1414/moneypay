@echo off
echo 🚀 MoneyPay Deployment Script
echo =============================

REM Check if we're in the right directory
if not exist "frontend" (
    echo ❌ Error: Please run this script from the root directory of the project
    pause
    exit /b 1
)

if not exist "backend" (
    echo ❌ Error: Please run this script from the root directory of the project
    pause
    exit /b 1
)

echo 📦 Building frontend...
cd frontend
call npm install

if %errorlevel% neq 0 (
    echo ❌ Frontend npm install failed
    cd ..
    pause
    exit /b 1
)

call npm run build

if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    cd ..
    pause
    exit /b 1
)

cd ..
echo ✅ Frontend built successfully
echo.
echo 📋 Next steps:
echo 1. Deploy your backend to Railway, Render, or Heroku
echo 2. Get your backend API URL
echo 3. Set VITE_API_URL environment variable in Vercel
echo 4. Deploy frontend to Vercel:
echo    cd frontend
echo    vercel --prod
echo.
echo 📚 Check README.md for detailed deployment instructions
pause
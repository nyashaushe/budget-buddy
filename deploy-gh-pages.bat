@echo off
echo ===== Budget Buddy GitHub Pages Deployment =====
echo.
echo This script will build and deploy the frontend to GitHub Pages
echo.

cd frontend
echo Building the React application...
call npm run build

if %ERRORLEVEL% neq 0 (
  echo Error: Build failed!
  exit /b %ERRORLEVEL%
)

echo Build successful!
echo.
echo Deploying to GitHub Pages...
call npm run deploy

if %ERRORLEVEL% neq 0 (
  echo Error: Deployment failed!
  exit /b %ERRORLEVEL%
)

echo.
echo ===== Deployment Complete! =====
echo Your application should be available at:
echo https://nyashaushe.github.io/budget-buddy/
echo.

cd .. 
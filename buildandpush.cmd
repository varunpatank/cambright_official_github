@echo off
echo Building CamBright Docker image...
echo.

REM Build the Docker image with build-time optimizations
docker build -t ghcr.io/not-varram/cambright:latest .

REM Check if build was successful
if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ Docker build failed!
    echo Please check the build logs above for errors.
    pause
    exit /b 1
)

echo.
echo ✅ Docker build completed successfully!
echo.

echo Pushing image to GitHub Container Registry...
docker push ghcr.io/not-varram/cambright:latest

REM Check if push was successful
if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ Docker push failed!
    echo Please check your authentication and network connection.
    pause
    exit /b 1
)

echo.
echo ✅ Docker image pushed successfully!
echo.
echo 🚀 Image available at: ghcr.io/not-varram/cambright:latest
echo.
echo To run the container:
echo   docker run -d -p 3000:3000 --env-file .env ghcr.io/not-varram/cambright:latest
echo.
echo To use with docker-compose:
echo   Update docker-compose.yml to use: image: ghcr.io/not-varram/cambright:latest
echo.
pause
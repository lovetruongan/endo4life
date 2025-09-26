#!/bin/bash

echo "====================================="
echo "Endo4Life Local Development Setup"
echo "====================================="

# Export environment variables
export VITE_ENDO4LIFE_SERVICE_URL=http://localhost:8080
export VITE_ENDO4LIFE_APP_URL=https://keycloak.mydevopsproject2023.id.vn
export VITE_ENDO4LIFE_ADMIN_WEB_URL=http://localhost:3000
export VITE_ENDO4LIFE_USER_WEB_URL=http://localhost:3001
export VITE_ENDO4LIFE_APP_REALM=endo4life
export VITE_ENDO4LIFE_APP_CLIENT=endo4life_app
export VITE_ENDO4LIFE_USER_SERVICE_URL=http://localhost:8080

echo ""
echo "Environment Variables Set:"
echo "- Backend API: $VITE_ENDO4LIFE_SERVICE_URL"
echo "- Keycloak URL: $VITE_ENDO4LIFE_APP_URL"
echo "- Keycloak Realm: $VITE_ENDO4LIFE_APP_REALM"
echo "- Keycloak Client: $VITE_ENDO4LIFE_APP_CLIENT"
echo ""

# Check if backend is running
echo "Checking backend status..."
if curl -f -s http://localhost:8080/actuator/health >/dev/null 2>&1; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running!"
    echo "Please start the backend first:"
    echo "cd backend && ./mvnw spring-boot:run"
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Navigate to frontend directory
cd endo4life-frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo ""
echo "Starting Admin Web on http://localhost:3000"
echo ""
echo "Login flow:"
echo "1. Browser will redirect to Keycloak login"
echo "2. Use your Keycloak credentials"
echo "3. After login, you'll be redirected back to the app"
echo ""

# Run the admin web
npm run start:admin

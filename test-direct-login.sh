#!/bin/bash

echo "====================================="
echo "Testing Direct Login to Keycloak"
echo "====================================="

# Test with your credentials
USERNAME="anngu"
PASSWORD="123456"
CLIENT_ID="endo4life_app"
CLIENT_SECRET="0LsxczPTGzHaGeZI8N9mIWn0XbtNfF4d"
KEYCLOAK_URL="https://keycloak.mydevopsproject2023.id.vn"
REALM="endo4life"

echo ""
echo "Testing password grant authentication..."
echo "Username: $USERNAME"
echo "Client ID: $CLIENT_ID"
echo ""

response=$(curl -s --location "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'grant_type=password' \
  --data-urlencode "client_id=${CLIENT_ID}" \
  --data-urlencode "client_secret=${CLIENT_SECRET}" \
  --data-urlencode "username=${USERNAME}" \
  --data-urlencode "password=${PASSWORD}")

# Check if we got an access token
if echo "$response" | grep -q "access_token"; then
    echo "✅ Login successful!"
    echo ""
    echo "Response:"
    echo "$response" | python3 -m json.tool
    
    # Extract access token
    ACCESS_TOKEN=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
    echo ""
    echo "Access token (first 50 chars):"
    echo "${ACCESS_TOKEN:0:50}..."
else
    echo "❌ Login failed!"
    echo ""
    echo "Response:"
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    echo ""
    echo "Make sure:"
    echo "1. Username and password are correct"
    echo "2. Direct Access Grants are enabled in Keycloak client settings"
    echo "3. Client secret is correct (or client is public)"
fi

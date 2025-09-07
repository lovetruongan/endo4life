#!/bin/bash

set -e

echo "🚀 Starting Endo4Life Services Health Check..."
echo "=================================================="

# Function to check service availability via URL
check_service_url() {
    local service_name=$1
    local url=$2
    local timeout=${3:-10}
    local expected_status=${4:-200}
    
    echo "🔍 Checking $service_name at $url..."
    
    # Use curl with proper error handling and follow redirects
    if timeout $timeout bash -c "
        until response=\$(curl -s -o /dev/null -w '%{http_code}' -L '$url' 2>/dev/null); do
            echo 'Waiting for $service_name...'; 
            sleep 2; 
        done
        if [[ \$response -eq $expected_status ]] || [[ \$response -eq 301 ]] || [[ \$response -eq 302 ]]; then
            exit 0
        else
            exit 1
        fi
    "; then
        echo "✅ $service_name is available at $url"
    else
        echo "❌ $service_name failed health check at $url"
        return 1
    fi
    
    echo ""
}

# Function to check TCP port (for database)
check_tcp_port() {
    local service_name=$1
    local host=$2
    local port=$3
    local timeout=${4:-10}
    
    echo "🔍 Checking $service_name TCP connection on $host:$port..."
    
    if timeout $timeout bash -c "until nc -z $host $port; do echo 'Waiting for $service_name...'; sleep 2; done"; then
        echo "✅ $service_name is available on $host:$port"
    else
        echo "❌ $service_name failed connection check"
        return 1
    fi
    
    echo ""
}

# Determine environment and set appropriate URLs
if [ "${CI_ENVIRONMENT:-}" = "production" ] || [ "${ENVIRONMENT:-}" = "production" ]; then
    echo "🌐 Production environment detected - checking HTTPS domains"
    PROTOCOL="https"
    PGADMIN_URL="https://pgadmin.endo4life.shop"
    KEYCLOAK_URL="https://keycloak.endo4life.shop"
    MINIO_API_URL="https://minio-api.endo4life.shop/minio/health/live"
    MINIO_CONSOLE_URL="https://minio.endo4life.shop"
    BACKEND_URL="https://api.endo4life.shop/actuator/health"
    TRAEFIK_URL="https://traefik.endo4life.shop"
    
    # For production, we still need to check PostgreSQL via host IP
    HOST_TARGET=${HOST_IP:-localhost}
else
    echo "🏠 Local/Development environment detected - checking localhost ports"
    PROTOCOL="http"
    HOST_TARGET=${HOST_IP:-localhost}
    PGADMIN_URL="http://$HOST_TARGET:5050"
    KEYCLOAK_URL="http://$HOST_TARGET:7070"
    MINIO_API_URL="http://$HOST_TARGET:9000/minio/health/live"
    MINIO_CONSOLE_URL="http://$HOST_TARGET:9001"
    BACKEND_URL="http://$HOST_TARGET:8080/actuator/health"
    TRAEFIK_URL="http://$HOST_TARGET:8080"
fi

echo "🎯 Target host: $HOST_TARGET"
echo "🔗 Protocol: $PROTOCOL"
echo ""

# Check all services
echo "🔍 Performing health checks for all services..."
echo ""

# PostgreSQL - Always check via TCP (not exposed through Traefik)
check_tcp_port "PostgreSQL" "$HOST_TARGET" "5432" 10

# Traefik Dashboard (if production)
if [ "${CI_ENVIRONMENT:-}" = "production" ] || [ "${ENVIRONMENT:-}" = "production" ]; then
    check_service_url "Traefik Dashboard" "$TRAEFIK_URL" 30 200
fi

# PgAdmin - HTTP check
check_service_url "PgAdmin" "$PGADMIN_URL" 15 200

# Keycloak - HTTP check (longer timeout as it takes time to start)
check_service_url "Keycloak" "$KEYCLOAK_URL" 60 200

# MinIO API - Health endpoint check
check_service_url "MinIO API" "$MINIO_API_URL" 15 200

# MinIO Console - HTTP check
check_service_url "MinIO Console" "$MINIO_CONSOLE_URL" 15 200

# Backend API - Health check (if available)
check_service_url "Backend API" "$BACKEND_URL" 30 200

# Summary
echo "=================================================="
echo "🎉 All Endo4Life services are healthy and available!"
echo ""
echo "📊 Service Status Summary:"
echo "   - PostgreSQL:    $HOST_TARGET:5432 ✅"
echo "   - PgAdmin:       $PGADMIN_URL ✅"
echo "   - Keycloak:      $KEYCLOAK_URL ✅"
echo "   - MinIO API:     $MINIO_API_URL ✅"
echo "   - MinIO Console: $MINIO_CONSOLE_URL ✅"
echo "   - Backend API:   $BACKEND_URL ✅"
if [ "${CI_ENVIRONMENT:-}" = "production" ] || [ "${ENVIRONMENT:-}" = "production" ]; then
    echo "   - Traefik:       $TRAEFIK_URL ✅"
fi
echo ""
echo "🚀 Ready for development!"

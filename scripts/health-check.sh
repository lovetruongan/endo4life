#!/bin/bash

set -e

echo "🚀 Starting Endo4Life Services Health Check..."
echo "=================================================="

# Function to check TCP port availability using bash
check_tcp_port() {
    local host=$1
    local port=$2
    local timeout=3
    
    timeout $timeout bash -c "exec 3<>/dev/tcp/$host/$port" 2>/dev/null
}

# Function to check service availability
check_service() {
    local service_name=$1
    local host=$2
    local port=$3
    local endpoint=${4:-""}
    local timeout=${5:-10}
    
    echo "🔍 Checking $service_name on port $port..."
    
    if [ -n "$endpoint" ]; then
        # HTTP health check
        if timeout $timeout bash -c "until curl -f http://$host:$port$endpoint > /dev/null 2>&1; do echo 'Waiting for $service_name...'; sleep 2; done"; then
            echo "✅ $service_name is available at http://$host:$port$endpoint"
        else
            echo "❌ $service_name failed health check"
            return 1
        fi
    else
        # TCP port check using netcat
        if timeout $timeout bash -c "until nc -z $host $port; do echo 'Waiting for $service_name...'; sleep 2; done"; then
            echo "✅ $service_name is available on $host:$port"
        else
            echo "❌ $service_name failed connection check"
            return 1
        fi
    fi
    
    echo ""
}

# Determine host IP (use environment variable if set, otherwise localhost)
HOST_TARGET=${HOST_IP:-localhost}
echo "🎯 Target host: $HOST_TARGET"
echo ""

# Check all services
echo "🔍 Performing health checks for all services..."
echo ""

# PostgreSQL - TCP check
check_service "PostgreSQL" "$HOST_TARGET" "5432" "" 10

# PgAdmin - HTTP check
check_service "PgAdmin" "$HOST_TARGET" "5050" "" 10

# Keycloak - HTTP check (longer timeout as it takes time to start)
check_service "Keycloak" "$HOST_TARGET" "7070" "" 30

# MinIO API - Health endpoint check
check_service "MinIO API" "$HOST_TARGET" "9000" "/minio/health/live" 10

# MinIO Console - HTTP check
check_service "MinIO Console" "$HOST_TARGET" "9001" "" 10

# Summary
echo "=================================================="
echo "🎉 All Endo4Life services are healthy and available!"
echo ""
echo "📊 Service Status Summary:"
echo "   - PostgreSQL:    http://$HOST_TARGET:5432 ✅"
echo "   - PgAdmin:       http://$HOST_TARGET:5050 ✅"
echo "   - Keycloak:      http://$HOST_TARGET:7070 ✅"
echo "   - MinIO API:     http://$HOST_TARGET:9000 ✅"
echo "   - MinIO Console: http://$HOST_TARGET:9001 ✅"
echo ""
echo "🚀 Ready for development!"

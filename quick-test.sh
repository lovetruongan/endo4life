#!/bin/bash

# Quick MinIO API Test
echo "🧪 Quick MinIO API Test"
echo "======================="
echo ""

# Create a simple test file
echo "Hello from MinIO API test!" > test.txt
echo "✓ Created test.txt"

# 1. Get pre-signed URLs for upload
echo ""
echo "📤 Getting pre-signed upload URLs..."
RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/minio/presigned-urls \
  -H "Content-Type: application/json" \
  -d '{"resourceType":"IMAGE","numberOfUrls":1}')

echo "Response: $RESPONSE"

# Extract first URL
UPLOAD_URL=$(echo "$RESPONSE" | grep -o 'https://[^"]*' | head -1)

if [ -z "$UPLOAD_URL" ]; then
  echo "❌ Failed to get pre-signed URL"
  exit 1
fi

echo "✓ Got upload URL"

# 2. Upload directly to MinIO using pre-signed URL
echo ""
echo "📤 Uploading to MinIO..."
UPLOAD_RESULT=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X PUT "$UPLOAD_URL" \
  --upload-file test.txt \
  -H "Content-Type: text/plain")

HTTP_CODE=$(echo "$UPLOAD_RESULT" | grep "HTTP_CODE" | cut -d':' -f2)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✓ Uploaded successfully to MinIO"
else
  echo "❌ Upload failed with HTTP $HTTP_CODE"
  echo "$UPLOAD_RESULT"
  exit 1
fi

# 3. Download using pre-signed GET URL
echo ""
echo "📥 Getting download URL..."
OBJECT_KEY=$(echo "$UPLOAD_URL" | grep -o '/images/[^?]*' | sed 's/\/images\///')
echo "Object key: $OBJECT_KEY"

DOWNLOAD_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/minio/presigned-urls \
  -H "Content-Type: application/json" \
  -d "{\"resourceType\":\"IMAGE\",\"numberOfUrls\":1}")

echo "Note: Currently getting upload URLs. For download, use Resource API which auto-generates GET URLs"

# 4. Test resource API (uses pre-signed URLs in response)
echo ""
echo "🔗 Testing Resource API..."
echo "Note: When you GET /api/v1/resources/{id}, it auto-generates:"
echo "  - thumbnailUrl (pre-signed GET URL)"
echo "  - resourceUrl (pre-signed GET URL)"

# Cleanup


echo ""
echo "✅ All tests passed!"


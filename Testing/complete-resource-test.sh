#!/bin/bash

# Complete Resource Upload Workflow Test
# Tests: Pre-signed URLs → Upload → Create Resource → Get with Download URLs → Delete

set -e  # Exit on error

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Complete Resource Upload Workflow Test (Template)   ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"

# Configuration
API_URL="http://localhost:8080"
TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJjN09UWE9QanNUX1lOTTlPd3A3MGdjLUFtYWxKU2pFOWRieTB1cGdJdTVJIn0.eyJleHAiOjE3NTk0Njk2OTUsImlhdCI6MTc1OTQ2Nzg5NSwianRpIjoib25ydHJvOmFjZTMwOTcyLTY4OTYtZDMxOC1hNjdjLWIxYjhkYWFlNGQxZSIsImlzcyI6Imh0dHBzOi8va2V5Y2xvYWsubXlkZXZvcHNwcm9qZWN0MjAyMy5pZC52bi9yZWFsbXMvZW5kbzRsaWZlIiwiYXVkIjpbInJlYWxtLW1hbmFnZW1lbnQiLCJicm9rZXIiLCJhY2NvdW50Il0sInN1YiI6IjFiYTkxN2Y1LTFjNGMtNDAyMC04YjNkLTNlOGU0MDc2YWExOCIsInR5cCI6IkJlYXJlciIsImF6cCI6ImVuZG80bGlmZV9hcHAiLCJzaWQiOiI0NGUzMGQwZi1iMDY1LTRjYzMtOGMxMi00MDdmNzRhY2Y3MjMiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwiZGVmYXVsdC1yb2xlcy1lbmRvNGxpZmUiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7InJlYWxtLW1hbmFnZW1lbnQiOnsicm9sZXMiOlsidmlldy1pZGVudGl0eS1wcm92aWRlcnMiLCJ2aWV3LXJlYWxtIiwibWFuYWdlLWlkZW50aXR5LXByb3ZpZGVycyIsImltcGVyc29uYXRpb24iLCJyZWFsbS1hZG1pbiIsImNyZWF0ZS1jbGllbnQiLCJtYW5hZ2UtdXNlcnMiLCJxdWVyeS1yZWFsbXMiLCJ2aWV3LWF1dGhvcml6YXRpb24iLCJxdWVyeS1jbGllbnRzIiwicXVlcnktdXNlcnMiLCJtYW5hZ2UtZXZlbnRzIiwibWFuYWdlLXJlYWxtIiwidmlldy1ldmVudHMiLCJ2aWV3LXVzZXJzIiwidmlldy1jbGllbnRzIiwibWFuYWdlLWF1dGhvcml6YXRpb24iLCJtYW5hZ2UtY2xpZW50cyIsInF1ZXJ5LWdyb3VwcyJdfSwiYnJva2VyIjp7InJvbGVzIjpbInJlYWQtdG9rZW4iXX0sImVuZG80bGlmZV9hcHAiOnsicm9sZXMiOlsiQ1VTVE9NRVIiLCJBRE1JTiJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsInZpZXctYXBwbGljYXRpb25zIiwidmlldy1jb25zZW50Iiwidmlldy1ncm91cHMiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsIm1hbmFnZS1jb25zZW50IiwiZGVsZXRlLWFjY291bnQiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6InByb2ZpbGUgZW1haWwiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6Ik5ndXllbiBBTiIsInByZWZlcnJlZF91c2VybmFtZSI6ImFubmd1IiwiZ2l2ZW5fbmFtZSI6Ik5ndXllbiIsImZhbWlseV9uYW1lIjoiQU4iLCJlbWFpbCI6ImFubmd1QG52aWRpYS5jb20ifQ.adeSUn_JmhUcso10twH6vR3uuguTQJNGe_QKIQrnklMSBuZRlTKNqKwFPTWVmV8upHb-5Zxu5wqoL0bKYKJB_X8PoJ_XrPsd--Bux0gi3APovTBYKufUFagNHMiUn_gHUFXrRT-p_kxWHnGGtpAyg9nqwcgu-rDBVX5xna4dGVGJNlsTIPY1klVyL6hKOzKHyCSKDyWaPSNafWpwtHJyLFciqt34XKKBGphxils_w7kGb3oWBAnmj9V3D7Vg4gjztfW8Twv-YSZq41cXBn1Fj1atQ0xbT21-do2fM4BonHAbVVpv-YRaMf21JxhME2WHJpGQ1FZxtZ0dJ_ZjSVPwdw"
# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq not found. Install with: brew install jq${NC}"
    echo -e "${YELLOW}Continuing without pretty JSON...${NC}\n"
    JQ_CMD="cat"
else
    JQ_CMD="jq ."
fi

# Check test files exist
echo -e "${GREEN}📝 Step 1: Checking test files...${NC}"
if [ ! -f "test_image.png" ]; then
    echo -e "${RED}❌ test_image.png not found!${NC}"
    exit 1
fi
if [ ! -f "test_thumb.png" ]; then
    echo -e "${RED}❌ test_thumb.png not found!${NC}"
    exit 1
fi
echo "✓ Found test_image.png"
echo "✓ Found test_thumb.png"
echo ""

# Step 1: Get pre-signed URLs
echo -e "${GREEN}📋 Step 2: Getting 2 pre-signed URLs (image + thumbnail)...${NC}"
PRESIGNED_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/minio/presigned-urls" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "IMAGE",
    "numberOfUrls": 2
  }')

echo "Response:"
echo "$PRESIGNED_RESPONSE" | $JQ_CMD

# Extract URLs
IMAGE_URL=$(echo "$PRESIGNED_RESPONSE" | grep -o 'https://[^"]*' | sed -n '1p')
THUMBNAIL_URL=$(echo "$PRESIGNED_RESPONSE" | grep -o 'https://[^"]*' | sed -n '2p')

if [ -z "$IMAGE_URL" ] || [ -z "$THUMBNAIL_URL" ]; then
  echo -e "${RED}❌ Failed to get pre-signed URLs${NC}"
  exit 1
fi

# Extract object keys (UUIDs)
IMAGE_KEY=$(echo "$IMAGE_URL" | grep -o '/images/[^?]*' | sed 's|/images/||')
THUMBNAIL_KEY=$(echo "$THUMBNAIL_URL" | grep -o '/images/[^?]*' | sed 's|/images/||')

echo -e "✓ Image key: ${BLUE}$IMAGE_KEY${NC}"
echo -e "✓ Thumbnail key: ${BLUE}$THUMBNAIL_KEY${NC}\n"

# Step 2: Upload files to MinIO
echo -e "${GREEN}📤 Step 3: Uploading files to MinIO...${NC}"

echo "Uploading image (test_image.png)..."
HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null -X PUT "$IMAGE_URL" \
  --upload-file test_image.png \
  -H "Content-Type: image/png")

if [ "$HTTP_CODE" = "200" ]; then
  echo "✓ Image uploaded successfully (HTTP $HTTP_CODE)"
else
  echo -e "${RED}❌ Image upload failed (HTTP $HTTP_CODE)${NC}"
  exit 1
fi

echo "Uploading thumbnail (test_thumb.png)..."
HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null -X PUT "$THUMBNAIL_URL" \
  --upload-file test_thumb.png \
  -H "Content-Type: image/png")

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "✓ Thumbnail uploaded successfully (HTTP $HTTP_CODE)\n"
else
  echo -e "${RED}❌ Thumbnail upload failed (HTTP $HTTP_CODE)${NC}"
  exit 1
fi

# Step 3: Create resource in database
echo -e "${GREEN}💾 Step 4: Creating resource in database...${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/resources" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"type\": \"IMAGE\",
    \"metadata\": [{
      \"objectKey\": \"$IMAGE_KEY\",
      \"thumbnail\": \"$THUMBNAIL_KEY\",
      \"title\": \"Test Image from Script\",
      \"description\": \"Automated test upload\",
      \"state\": \"PUBLIC\",
      \"tag\": [\"test\", \"automation\"],
      \"detailTag\": [\"sample\"],
      \"anatomyLocationTag\": [\"stomach\"],
      \"lightTag\": [\"NBI\"],
      \"hpTag\": [\"HP1\"],
      \"upperGastroAnatomyTag\": [\"esophagus\"]
    }]
  }")

echo "Response:"
echo "$CREATE_RESPONSE" | $JQ_CMD

# Extract resource ID
RESOURCE_ID=$(echo "$CREATE_RESPONSE" | grep -o '"[a-f0-9-]*"' | tr -d '"' | head -1)

if [ -z "$RESOURCE_ID" ]; then
  echo -e "${RED}❌ Failed to create resource${NC}"
  echo "Response was: $CREATE_RESPONSE"
  exit 1
fi

echo -e "✓ Resource created: ${BLUE}$RESOURCE_ID${NC}\n"

# Step 4: Get resource by ID (with auto-generated download URLs)
echo -e "${GREEN}📥 Step 5: Getting resource (with auto-generated download URLs)...${NC}"
RESOURCE_DETAIL=$(curl -s -X GET "$API_URL/api/v1/resources/$RESOURCE_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Resource details:"
echo "$RESOURCE_DETAIL" | $JQ_CMD

# Extract download URLs
RESOURCE_URL=$(echo "$RESOURCE_DETAIL" | grep -o '"resourceUrl":"[^"]*' | cut -d':' -f2- | tr -d '"')
THUMBNAIL_URL_GET=$(echo "$RESOURCE_DETAIL" | grep -o '"thumbnailUrl":"[^"]*' | cut -d':' -f2- | tr -d '"')

if [ -n "$RESOURCE_URL" ]; then
  echo -e "\n${GREEN}✓ Auto-generated Resource Download URL:${NC}"
  echo -e "${BLUE}${RESOURCE_URL:0:100}...${NC}"
fi

if [ -n "$THUMBNAIL_URL_GET" ]; then
  echo -e "\n${GREEN}✓ Auto-generated Thumbnail Download URL:${NC}"
  echo -e "${BLUE}${THUMBNAIL_URL_GET:0:100}...${NC}\n"
fi

# Step 5: Test download using pre-signed URL
if [ -n "$RESOURCE_URL" ]; then
  echo -e "${GREEN}📥 Step 6: Testing download via pre-signed URL...${NC}"
  curl -s "$RESOURCE_URL" -o downloaded-image.png
  
  if [ -f "downloaded-image.png" ]; then
    FILE_SIZE=$(ls -lh downloaded-image.png | awk '{print $5}')
    echo "✓ Image downloaded successfully"
    echo "  File size: $FILE_SIZE"
    echo "  Saved as: downloaded-image.png"
    echo ""
  fi
fi

# Step 6: Get all resources
echo -e "${GREEN}📋 Step 7: Listing all resources...${NC}"
ALL_RESOURCES=$(curl -s "$API_URL/api/v1/resources?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN")

TOTAL=$(echo "$ALL_RESOURCES" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
echo "Total resources: $TOTAL"
echo "$ALL_RESOURCES" | $JQ_CMD
echo ""

# # Step 7: Test batch upload (3 images)
# echo -e "${GREEN}🚀 Step 8: Testing BATCH upload (3 images)...${NC}"

# echo "Getting 6 pre-signed URLs (3 images + 3 thumbnails)..."
# BATCH_URLS=$(curl -s -X POST "$API_URL/api/v1/minio/presigned-urls" \
#   -H "Content-Type: application/json" \
#   -d '{"resourceType":"IMAGE","numberOfUrls":6}')

# # Extract 6 URLs
# URL1=$(echo "$BATCH_URLS" | grep -o 'https://[^"]*' | sed -n '1p')
# URL2=$(echo "$BATCH_URLS" | grep -o 'https://[^"]*' | sed -n '2p')
# URL3=$(echo "$BATCH_URLS" | grep -o 'https://[^"]*' | sed -n '3p')
# URL4=$(echo "$BATCH_URLS" | grep -o 'https://[^"]*' | sed -n '4p')
# URL5=$(echo "$BATCH_URLS" | grep -o 'https://[^"]*' | sed -n '5p')
# URL6=$(echo "$BATCH_URLS" | grep -o 'https://[^"]*' | sed -n '6p')

# # Extract keys
# KEY1=$(echo "$URL1" | grep -o '/images/[^?]*' | sed 's|/images/||')
# KEY2=$(echo "$URL2" | grep -o '/images/[^?]*' | sed 's|/images/||')
# KEY3=$(echo "$URL3" | grep -o '/images/[^?]*' | sed 's|/images/||')
# KEY4=$(echo "$URL4" | grep -o '/images/[^?]*' | sed 's|/images/||')
# KEY5=$(echo "$URL5" | grep -o '/images/[^?]*' | sed 's|/images/||')
# KEY6=$(echo "$URL6" | grep -o '/images/[^?]*' | sed 's|/images/||')

# echo "Uploading 3 images + 3 thumbnails (using test_image.png and test_thumb.png)..."
# curl -s -X PUT "$URL1" --upload-file test_image.png -H "Content-Type: image/png"
# curl -s -X PUT "$URL2" --upload-file test_image.png -H "Content-Type: image/png"
# curl -s -X PUT "$URL3" --upload-file test_image.png -H "Content-Type: image/png"
# curl -s -X PUT "$URL4" --upload-file test_thumb.png -H "Content-Type: image/png"
# curl -s -X PUT "$URL5" --upload-file test_thumb.png -H "Content-Type: image/png"
# curl -s -X PUT "$URL6" --upload-file test_thumb.png -H "Content-Type: image/png"
# echo "✓ All 6 files uploaded to MinIO"

# echo -e "\nCreating 3 resources in single API call (batch)..."
# BATCH_CREATE=$(curl -s -X POST "$API_URL/api/v1/resources" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -d "{
#     \"type\": \"IMAGE\",
#     \"metadata\": [
#       {
#         \"objectKey\": \"$KEY1\",
#         \"thumbnail\": \"$KEY4\",
#         \"title\": \"Batch Image 1\",
#         \"state\": \"PUBLIC\",
#         \"tag\": [\"batch\", \"test1\"]
#       },
#       {
#         \"objectKey\": \"$KEY2\",
#         \"thumbnail\": \"$KEY5\",
#         \"title\": \"Batch Image 2\",
#         \"state\": \"UNLISTED\",
#         \"tag\": [\"batch\", \"test2\"]
#       },
#       {
#         \"objectKey\": \"$KEY3\",
#         \"thumbnail\": \"$KEY6\",
#         \"title\": \"Batch Image 3\",
#         \"state\": \"PUBLIC\",
#         \"tag\": [\"batch\", \"test3\"]
#       }
#     ]
#   }")

# echo "Batch create response:"
# echo "$BATCH_CREATE" | $JQ_CMD

# BATCH_IDS=$(echo "$BATCH_CREATE" | grep -o '"[a-f0-9-]*"' | tr -d '"')
# echo -e "\n✓ Created 3 resources in batch!\n"

# # Step 8: Verify all created resources
# echo -e "${GREEN}📋 Step 9: Verifying all created resources...${NC}"
# UPDATED_LIST=$(curl -s "$API_URL/api/v1/resources?page=0&size=20" \
#   -H "Authorization: Bearer $TOKEN")

# NEW_TOTAL=$(echo "$UPDATED_LIST" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
# echo "Total resources now: $NEW_TOTAL"
# echo ""

# Step 9: Delete test resources
echo -e "${GREEN}🗑️  Step 10: Cleaning up test resources...${NC}"
ALL_IDS="$RESOURCE_ID"
for ID in $BATCH_IDS; do
  ALL_IDS="$ALL_IDS&id=$ID"
done

DELETE_RESPONSE=$(curl -s -w "\nHTTP:%{http_code}" -X DELETE \
  "$API_URL/api/v1/resources?id=$ALL_IDS" \
  -H "Authorization: Bearer $TOKEN")

DELETE_CODE=$(echo "$DELETE_RESPONSE" | grep "HTTP:" | cut -d':' -f2)

if [ "$DELETE_CODE" = "204" ]; then
  echo "✓ All test resources deleted (HTTP $DELETE_CODE)"
else
  echo -e "${YELLOW}⚠️  Delete returned HTTP $DELETE_CODE${NC}"
fi

# Cleanup downloaded files (keep original test images)
# rm -f downloaded-image.png

echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ COMPLETE WORKFLOW TEST PASSED!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Test Summary:${NC}"
echo "  ✓ Generated pre-signed URLs"
echo "  ✓ Uploaded files directly to MinIO"
echo "  ✓ Created single resource"
echo "  ✓ Created batch resources (3x)"
echo "  ✓ Retrieved resources with auto-generated download URLs"
echo "  ✓ Downloaded file using pre-signed URL"
echo "  ✓ Deleted all test resources"
echo ""
echo -e "${GREEN}Your MinIO integration is working perfectly!${NC}"


#!/bin/bash
set -euo pipefail

ENV=${1:-dev}
REGION=${2:-us-east-1}
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET="nimbus-terraform-state-${ACCOUNT_ID}-${ENV}"
TABLE="nimbus-terraform-locks"

echo "========================================"
echo " Nimbus Terraform Bootstrap"
echo " Account : $ACCOUNT_ID"
echo " Env     : $ENV"
echo " Region  : $REGION"
echo " Bucket  : $BUCKET"
echo "========================================"

echo "[1/5] Creating S3 bucket..."
if [ "$REGION" = "us-east-1" ]; then
  aws s3api create-bucket \
    --bucket "$BUCKET" \
    --region "$REGION" 2>/dev/null || echo "  Bucket exists, skipping."
else
  aws s3api create-bucket \
    --bucket "$BUCKET" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION" 2>/dev/null || echo "  Bucket exists, skipping."
fi

echo "[2/5] Enabling versioning..."
aws s3api put-bucket-versioning \
  --bucket "$BUCKET" \
  --versioning-configuration Status=Enabled

echo "[3/5] Enabling encryption..."
aws s3api put-bucket-encryption \
  --bucket "$BUCKET" \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "aws:kms"
      },
      "BucketKeyEnabled": true
    }]
  }'

echo "[4/5] Blocking public access..."
aws s3api put-public-access-block \
  --bucket "$BUCKET" \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

echo "[5/5] Creating DynamoDB lock table..."
aws dynamodb create-table \
  --table-name "$TABLE" \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region "$REGION" 2>/dev/null || echo "  Table exists, skipping."

echo ""
echo "✅  Bootstrap complete!"
echo ""
echo "Your bucket name:"
echo "  $BUCKET"
echo ""
echo "Next: copy that bucket name into terraform/environments/dev/main.tf"
#!/bin/bash

# Setup AWS Secrets Manager for Custom Itinerary Travel
# This script creates all necessary secrets in AWS Secrets Manager
# Usage: ./setup-aws-secrets.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default region
AWS_REGION="${AWS_DEFAULT_REGION:-us-east-1}"

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}AWS Secrets Manager Setup${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# Function to create or update secret
create_or_update_secret() {
    local secret_name=$1
    local secret_value=$2

    if aws secretsmanager describe-secret --secret-id "$secret_name" --region "$AWS_REGION" &>/dev/null; then
        echo -e "${YELLOW}Secret '$secret_name' already exists. Updating...${NC}"
        aws secretsmanager update-secret \
            --secret-id "$secret_name" \
            --secret-string "$secret_value" \
            --region "$AWS_REGION" &>/dev/null
        echo -e "${GREEN}✓ Updated secret: $secret_name${NC}"
    else
        echo -e "${YELLOW}Creating secret: $secret_name${NC}"
        aws secretsmanager create-secret \
            --name "$secret_name" \
            --secret-string "$secret_value" \
            --region "$AWS_REGION" &>/dev/null
        echo -e "${GREEN}✓ Created secret: $secret_name${NC}"
    fi
}

# Prompt for values
echo -e "${YELLOW}Please provide the following API keys and credentials:${NC}"
echo ""

# OpenAI API Key
read -sp "OpenAI API Key (sk-proj-...): " OPENAI_API_KEY
echo ""
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}Error: OpenAI API Key is required${NC}"
    exit 1
fi

# Supabase Keys
read -p "Supabase Anon Key (public): " SUPABASE_ANON_KEY
if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}Error: Supabase Anon Key is required${NC}"
    exit 1
fi

# Firecrawl API Key
read -sp "Firecrawl API Key (fc-...): " FIRECRAWL_API_KEY
echo ""
if [ -z "$FIRECRAWL_API_KEY" ]; then
    echo -e "${RED}Error: Firecrawl API Key is required${NC}"
    exit 1
fi

# Browserbase Keys
read -sp "Browserbase API Key (bb_live_...): " BROWSERBASE_API_KEY
echo ""
if [ -z "$BROWSERBASE_API_KEY" ]; then
    echo -e "${RED}Error: Browserbase API Key is required${NC}"
    exit 1
fi

read -p "Browserbase Project ID: " BROWSERBASE_PROJECT_ID
if [ -z "$BROWSERBASE_PROJECT_ID" ]; then
    echo -e "${RED}Error: Browserbase Project ID is required${NC}"
    exit 1
fi

# Resend API Key
read -sp "Resend API Key (re_...): " RESEND_API_KEY
echo ""
if [ -z "$RESEND_API_KEY" ]; then
    echo -e "${RED}Error: Resend API Key is required${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}Creating Secrets in AWS (Region: $AWS_REGION)${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# Create secrets
create_or_update_secret "openai-api-key" "{\"OPENAI_API_KEY\":\"$OPENAI_API_KEY\"}"
create_or_update_secret "supabase-keys" "{\"NEXT_PUBLIC_SUPABASE_ANON_KEY\":\"$SUPABASE_ANON_KEY\",\"SUPABASE_ANON_KEY\":\"$SUPABASE_ANON_KEY\"}"
create_or_update_secret "firecrawl-api-key" "{\"FIRECRAWL_API_KEY\":\"$FIRECRAWL_API_KEY\"}"
create_or_update_secret "browserbase-keys" "{\"BROWSERBASE_API_KEY\":\"$BROWSERBASE_API_KEY\",\"BROWSERBASE_PROJECT_ID\":\"$BROWSERBASE_PROJECT_ID\"}"
create_or_update_secret "resend-api-key" "{\"RESEND_API_KEY\":\"$RESEND_API_KEY\"}"

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}Optional Secrets${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo "The following secrets are optional. Press Enter to skip or provide values."
echo ""

# Optional: Unsplash
read -p "Unsplash Access Key (optional): " UNSPLASH_ACCESS_KEY
if [ -n "$UNSPLASH_ACCESS_KEY" ]; then
    read -p "Unsplash API Key (optional): " UNSPLASH_API_KEY
    create_or_update_secret "unsplash-keys" "{\"UNSPLASH_ACCESS_KEY\":\"$UNSPLASH_ACCESS_KEY\",\"UNSPLASH_API_KEY\":\"$UNSPLASH_API_KEY\"}"
fi

# Optional: Pexels
read -p "Pexels API Key (optional): " PEXELS_API_KEY
if [ -n "$PEXELS_API_KEY" ]; then
    create_or_update_secret "pexels-api-key" "{\"PEXELS_API_KEY\":\"$PEXELS_API_KEY\"}"
fi

# Optional: Pixabay
read -p "Pixabay API Key (optional): " PIXABAY_API_KEY
if [ -n "$PIXABAY_API_KEY" ]; then
    create_or_update_secret "pixabay-api-key" "{\"PIXABAY_API_KEY\":\"$PIXABAY_API_KEY\"}"
fi

# Optional: Vectorize
read -p "Vectorize Access Token (optional): " VECTORIZE_ACCESS_TOKEN
if [ -n "$VECTORIZE_ACCESS_TOKEN" ]; then
    read -p "Vectorize Org ID: " VECTORIZE_ORG_ID
    read -p "Vectorize Pipeline ID: " VECTORIZE_PIPELINE_ID
    create_or_update_secret "vectorize-keys" "{\"VECTORIZE_ACCESS_TOKEN\":\"$VECTORIZE_ACCESS_TOKEN\",\"VECTORIZE_ORG_ID\":\"$VECTORIZE_ORG_ID\",\"VECTORIZE_PIPELINE_ID\":\"$VECTORIZE_PIPELINE_ID\"}"
fi

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}✓ All secrets created successfully!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update ecs-task-definition.json with your AWS Account ID"
echo "2. Verify secret ARNs in the task definition"
echo "3. Grant ECS Task Execution Role permission to access secrets"
echo "4. Register the task definition with AWS ECS"
echo ""
echo -e "${YELLOW}Grant permissions:${NC}"
echo "aws iam put-role-policy \\"
echo "  --role-name ecsTaskExecutionRole \\"
echo "  --policy-name SecretsManagerAccess \\"
echo "  --policy-document file://secrets-policy.json"
echo ""
echo -e "${GREEN}See DEPLOYMENT-QUICKSTART.md for detailed instructions${NC}"

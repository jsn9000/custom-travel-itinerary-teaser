#!/bin/bash

# Create AWS Infrastructure for Custom Itinerary Travel
# This script creates all necessary AWS resources for ECS Fargate deployment
# Usage: ./create-aws-infrastructure.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
AWS_REGION="${AWS_DEFAULT_REGION:-us-east-1}"
ECR_REPOSITORY="custom-itinerary-travel"
ECS_CLUSTER="custom-itinerary-cluster"
ECS_SERVICE="custom-itinerary-service"
ECS_TASK_DEFINITION="custom-itinerary-task"
LOG_GROUP="/ecs/custom-itinerary-task"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}AWS Infrastructure Setup${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Check AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    echo "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials are configured
if ! aws sts get-caller-identity &>/dev/null; then
    echo -e "${RED}Error: AWS credentials are not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✓ AWS Account ID: $AWS_ACCOUNT_ID${NC}"
echo -e "${GREEN}✓ AWS Region: $AWS_REGION${NC}"
echo ""

# Prompt for configuration
read -p "Do you want to use custom names? (y/N): " USE_CUSTOM
if [[ $USE_CUSTOM =~ ^[Yy]$ ]]; then
    read -p "ECR Repository name [$ECR_REPOSITORY]: " CUSTOM_ECR
    ECR_REPOSITORY=${CUSTOM_ECR:-$ECR_REPOSITORY}

    read -p "ECS Cluster name [$ECS_CLUSTER]: " CUSTOM_CLUSTER
    ECS_CLUSTER=${CUSTOM_CLUSTER:-$ECS_CLUSTER}

    read -p "ECS Service name [$ECS_SERVICE]: " CUSTOM_SERVICE
    ECS_SERVICE=${CUSTOM_SERVICE:-$ECS_SERVICE}

    read -p "Task Definition name [$ECS_TASK_DEFINITION]: " CUSTOM_TASK
    ECS_TASK_DEFINITION=${CUSTOM_TASK:-$ECS_TASK_DEFINITION}
fi

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Configuration${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "ECR Repository:     ${YELLOW}$ECR_REPOSITORY${NC}"
echo -e "ECS Cluster:        ${YELLOW}$ECS_CLUSTER${NC}"
echo -e "ECS Service:        ${YELLOW}$ECS_SERVICE${NC}"
echo -e "Task Definition:    ${YELLOW}$ECS_TASK_DEFINITION${NC}"
echo -e "CloudWatch Logs:    ${YELLOW}$LOG_GROUP${NC}"
echo ""

read -p "Proceed with these settings? (Y/n): " PROCEED
if [[ $PROCEED =~ ^[Nn]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Step 1: Creating ECR Repository${NC}"
echo -e "${BLUE}======================================${NC}"

if aws ecr describe-repositories --repository-names "$ECR_REPOSITORY" --region "$AWS_REGION" &>/dev/null; then
    echo -e "${YELLOW}ECR repository '$ECR_REPOSITORY' already exists${NC}"
else
    echo -e "${YELLOW}Creating ECR repository...${NC}"
    aws ecr create-repository \
        --repository-name "$ECR_REPOSITORY" \
        --region "$AWS_REGION" \
        --image-scanning-configuration scanOnPush=true \
        --encryption-configuration encryptionType=AES256 > /dev/null
    echo -e "${GREEN}✓ Created ECR repository: $ECR_REPOSITORY${NC}"
fi

ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY"
echo -e "${GREEN}✓ ECR URI: $ECR_URI${NC}"

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Step 2: Creating ECS Cluster${NC}"
echo -e "${BLUE}======================================${NC}"

if aws ecs describe-clusters --clusters "$ECS_CLUSTER" --region "$AWS_REGION" --query 'clusters[0].status' --output text 2>/dev/null | grep -q "ACTIVE"; then
    echo -e "${YELLOW}ECS cluster '$ECS_CLUSTER' already exists${NC}"
else
    echo -e "${YELLOW}Creating ECS cluster...${NC}"
    aws ecs create-cluster \
        --cluster-name "$ECS_CLUSTER" \
        --region "$AWS_REGION" \
        --capacity-providers FARGATE FARGATE_SPOT \
        --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 > /dev/null
    echo -e "${GREEN}✓ Created ECS cluster: $ECS_CLUSTER${NC}"
fi

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Step 3: Creating CloudWatch Log Group${NC}"
echo -e "${BLUE}======================================${NC}"

if aws logs describe-log-groups --log-group-name-prefix "$LOG_GROUP" --region "$AWS_REGION" --query 'logGroups[0].logGroupName' --output text 2>/dev/null | grep -q "$LOG_GROUP"; then
    echo -e "${YELLOW}CloudWatch log group '$LOG_GROUP' already exists${NC}"
else
    echo -e "${YELLOW}Creating CloudWatch log group...${NC}"
    aws logs create-log-group \
        --log-group-name "$LOG_GROUP" \
        --region "$AWS_REGION"
    echo -e "${GREEN}✓ Created CloudWatch log group: $LOG_GROUP${NC}"
fi

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Step 4: IAM Roles${NC}"
echo -e "${BLUE}======================================${NC}"

# Check if ecsTaskExecutionRole exists
if aws iam get-role --role-name ecsTaskExecutionRole &>/dev/null; then
    echo -e "${GREEN}✓ IAM role 'ecsTaskExecutionRole' already exists${NC}"
else
    echo -e "${YELLOW}Creating ecsTaskExecutionRole...${NC}"

    # Create trust policy
    cat > /tmp/ecs-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

    aws iam create-role \
        --role-name ecsTaskExecutionRole \
        --assume-role-policy-document file:///tmp/ecs-trust-policy.json > /dev/null

    # Attach AWS managed policy
    aws iam attach-role-policy \
        --role-name ecsTaskExecutionRole \
        --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

    echo -e "${GREEN}✓ Created IAM role: ecsTaskExecutionRole${NC}"
    rm /tmp/ecs-trust-policy.json
fi

# Add Secrets Manager permissions
echo -e "${YELLOW}Adding Secrets Manager permissions to ecsTaskExecutionRole...${NC}"
if [ -f "secrets-policy.json" ]; then
    aws iam put-role-policy \
        --role-name ecsTaskExecutionRole \
        --policy-name SecretsManagerAccess \
        --policy-document file://secrets-policy.json
    echo -e "${GREEN}✓ Added Secrets Manager permissions${NC}"
else
    echo -e "${YELLOW}⚠ secrets-policy.json not found - you'll need to add Secrets Manager permissions manually${NC}"
fi

# Check if ecsTaskRole exists
if aws iam get-role --role-name ecsTaskRole &>/dev/null; then
    echo -e "${GREEN}✓ IAM role 'ecsTaskRole' already exists${NC}"
else
    echo -e "${YELLOW}Creating ecsTaskRole...${NC}"

    aws iam create-role \
        --role-name ecsTaskRole \
        --assume-role-policy-document file:///tmp/ecs-trust-policy.json > /dev/null || true

    echo -e "${GREEN}✓ Created IAM role: ecsTaskRole${NC}"
fi

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Step 5: Task Definition${NC}"
echo -e "${BLUE}======================================${NC}"

if [ ! -f "ecs-task-definition.json" ]; then
    echo -e "${RED}Error: ecs-task-definition.json not found${NC}"
    echo "Please ensure the file exists in the current directory"
    exit 1
fi

# Update task definition with actual values
echo -e "${YELLOW}Updating ecs-task-definition.json with your AWS Account ID...${NC}"
sed -i.bak "s/YOUR_AWS_ACCOUNT_ID/$AWS_ACCOUNT_ID/g" ecs-task-definition.json
echo -e "${GREEN}✓ Updated task definition (backup saved as ecs-task-definition.json.bak)${NC}"

echo -e "${YELLOW}Registering task definition...${NC}"
TASK_DEF_ARN=$(aws ecs register-task-definition \
    --cli-input-json file://ecs-task-definition.json \
    --region "$AWS_REGION" \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text)

echo -e "${GREEN}✓ Registered task definition: $TASK_DEF_ARN${NC}"

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Step 6: VPC and Security Group${NC}"
echo -e "${BLUE}======================================${NC}"

# Get default VPC
DEFAULT_VPC=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query 'Vpcs[0].VpcId' --output text --region "$AWS_REGION")

if [ "$DEFAULT_VPC" == "None" ] || [ -z "$DEFAULT_VPC" ]; then
    echo -e "${RED}Error: No default VPC found${NC}"
    echo "Please create a VPC or specify VPC/subnet/security group IDs manually when creating the service"
    exit 1
fi

echo -e "${GREEN}✓ Using default VPC: $DEFAULT_VPC${NC}"

# Get subnets
SUBNETS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$DEFAULT_VPC" --query 'Subnets[*].SubnetId' --output text --region "$AWS_REGION")
SUBNET_1=$(echo $SUBNETS | awk '{print $1}')
SUBNET_2=$(echo $SUBNETS | awk '{print $2}')

echo -e "${GREEN}✓ Using subnets: $SUBNET_1, $SUBNET_2${NC}"

# Create security group
SG_NAME="custom-itinerary-sg"
if aws ec2 describe-security-groups --filters "Name=group-name,Values=$SG_NAME" --region "$AWS_REGION" --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null | grep -q "sg-"; then
    SECURITY_GROUP=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=$SG_NAME" --region "$AWS_REGION" --query 'SecurityGroups[0].GroupId' --output text)
    echo -e "${YELLOW}Security group '$SG_NAME' already exists: $SECURITY_GROUP${NC}"
else
    echo -e "${YELLOW}Creating security group...${NC}"
    SECURITY_GROUP=$(aws ec2 create-security-group \
        --group-name "$SG_NAME" \
        --description "Security group for Custom Itinerary Travel ECS tasks" \
        --vpc-id "$DEFAULT_VPC" \
        --region "$AWS_REGION" \
        --query 'GroupId' \
        --output text)

    # Allow inbound on port 3000
    aws ec2 authorize-security-group-ingress \
        --group-id "$SECURITY_GROUP" \
        --protocol tcp \
        --port 3000 \
        --cidr 0.0.0.0/0 \
        --region "$AWS_REGION" > /dev/null

    # Allow all outbound (default)
    echo -e "${GREEN}✓ Created security group: $SECURITY_GROUP${NC}"
    echo -e "${GREEN}✓ Allowed inbound traffic on port 3000${NC}"
fi

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Step 7: Creating ECS Service${NC}"
echo -e "${BLUE}======================================${NC}"

echo -e "${YELLOW}Do you want to create the ECS service now?${NC}"
echo -e "${YELLOW}Note: Ensure secrets are created in AWS Secrets Manager first!${NC}"
read -p "Create ECS service? (y/N): " CREATE_SERVICE

if [[ $CREATE_SERVICE =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Creating ECS service...${NC}"

    aws ecs create-service \
        --cluster "$ECS_CLUSTER" \
        --service-name "$ECS_SERVICE" \
        --task-definition "$ECS_TASK_DEFINITION" \
        --desired-count 1 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$SECURITY_GROUP],assignPublicIp=ENABLED}" \
        --region "$AWS_REGION" > /dev/null

    echo -e "${GREEN}✓ Created ECS service: $ECS_SERVICE${NC}"

    echo ""
    echo -e "${YELLOW}Waiting for service to stabilize (this may take 2-3 minutes)...${NC}"
    aws ecs wait services-stable \
        --cluster "$ECS_CLUSTER" \
        --services "$ECS_SERVICE" \
        --region "$AWS_REGION"

    echo -e "${GREEN}✓ Service is stable and running!${NC}"
else
    echo -e "${YELLOW}Skipping ECS service creation${NC}"
    echo -e "${YELLOW}You can create it later with:${NC}"
    echo ""
    echo "aws ecs create-service \\"
    echo "  --cluster $ECS_CLUSTER \\"
    echo "  --service-name $ECS_SERVICE \\"
    echo "  --task-definition $ECS_TASK_DEFINITION \\"
    echo "  --desired-count 1 \\"
    echo "  --launch-type FARGATE \\"
    echo "  --network-configuration \"awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$SECURITY_GROUP],assignPublicIp=ENABLED}\" \\"
    echo "  --region $AWS_REGION"
fi

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}✓ AWS Infrastructure Setup Complete!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo -e "  ECR Repository:  ${GREEN}$ECR_URI${NC}"
echo -e "  ECS Cluster:     ${GREEN}$ECS_CLUSTER${NC}"
echo -e "  Task Definition: ${GREEN}$ECS_TASK_DEFINITION${NC}"
echo -e "  Log Group:       ${GREEN}$LOG_GROUP${NC}"
echo -e "  Security Group:  ${GREEN}$SECURITY_GROUP${NC}"
echo -e "  Subnets:         ${GREEN}$SUBNET_1, $SUBNET_2${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Create secrets in AWS Secrets Manager (run ./setup-aws-secrets.sh)"
echo "2. Configure GitLab CI/CD variables (see gitlab-ci-variables.txt)"
echo "3. Push code to GitLab to trigger deployment"
echo "4. Monitor deployment in GitLab CI/CD > Pipelines"
echo ""
echo -e "${YELLOW}View logs:${NC}"
echo "aws logs tail $LOG_GROUP --follow --region $AWS_REGION"
echo ""
echo -e "${YELLOW}Check service status:${NC}"
echo "aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION"
echo ""

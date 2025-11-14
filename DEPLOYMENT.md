# AWS ECS Fargate Deployment Guide

This guide covers deploying the Custom Itinerary Travel application to AWS ECS Fargate using GitLab CI/CD.

## Prerequisites

### 1. AWS Resources Required

- **AWS Account** with appropriate permissions
- **ECR Repository** for Docker images
- **ECS Cluster** (Fargate)
- **ECS Service** and Task Definition
- **VPC** with public/private subnets
- **Application Load Balancer** (optional but recommended)
- **IAM Roles**:
  - ECS Task Execution Role (for pulling images, logging)
  - ECS Task Role (for application AWS service access)

### 2. GitLab CI/CD Variables

Configure these in GitLab: **Settings > CI/CD > Variables**

#### Required Variables

| Variable Name | Description | Example | Masked | Protected |
|--------------|-------------|---------|--------|-----------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | `AKIAIOSFODNN7EXAMPLE` | ✅ | ✅ |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | ✅ | ✅ |
| `AWS_ACCOUNT_ID` | Your AWS account ID | `123456789012` | ❌ | ✅ |
| `AWS_DEFAULT_REGION` | AWS region | `us-east-1` | ❌ | ❌ |

#### Optional Variables (Override defaults)

| Variable Name | Default Value | Description |
|--------------|---------------|-------------|
| `ECR_REPOSITORY` | `custom-itinerary-travel` | ECR repository name |
| `ECS_CLUSTER` | `custom-itinerary-cluster` | ECS cluster name |
| `ECS_SERVICE` | `custom-itinerary-service` | ECS service name |
| `ECS_TASK_DEFINITION` | `custom-itinerary-task` | Task definition family name |

## Environment Variables for Application

### Required in ECS Task Definition

These must be configured as environment variables in your ECS Task Definition:

```bash
# OpenAI API (REQUIRED)
OPENAI_API_KEY=sk-proj-your-actual-key-here

# Supabase Database (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://eaofdajkpqyddlbawdli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://eaofdajkpqyddlbawdli.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Storage (REQUIRED)
SUPABASE_BUCKET=wanderlog-edmonton-images
SUPABASE_EDGE_FUNCTION_URL=https://eaofdajkpqyddlbawdli.functions.supabase.co/fetch-and-store-image

# Firecrawl MCP (REQUIRED for Wanderlog scraping)
FIRECRAWL_API_KEY=fc-your-api-key-here

# Browserbase (REQUIRED for alternative scraping)
BROWSERBASE_API_KEY=bb_live_your-api-key-here
BROWSERBASE_PROJECT_ID=your-project-id-here

# Resend (REQUIRED for email functionality)
RESEND_API_KEY=re_your-api-key-here

# Node Environment
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Optional - Image Search APIs
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
UNSPLASH_API_KEY=your_unsplash_api_key_here
PEXELS_API_KEY=your_pexels_api_key_here
PIXABAY_API_KEY=your_pixabay_api_key_here

# Optional - Vectorize RAG
VECTORIZE_ACCESS_TOKEN=your_vectorize_token
VECTORIZE_ORG_ID=your_org_id
VECTORIZE_PIPELINE_ID=your_pipeline_id
```

### Recommended: Use AWS Secrets Manager or AWS Systems Manager Parameter Store

For sensitive values like API keys, use AWS Secrets Manager:

1. Store secrets in AWS Secrets Manager
2. Reference them in ECS Task Definition using `secrets` instead of `environment`
3. Grant ECS Task Execution Role permission to read secrets

Example in task definition:
```json
"secrets": [
  {
    "name": "OPENAI_API_KEY",
    "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:openai-api-key-ABC123"
  }
]
```

## AWS Setup Steps

### 1. Create ECR Repository

```bash
aws ecr create-repository \
  --repository-name custom-itinerary-travel \
  --region us-east-1
```

### 2. Create ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name custom-itinerary-cluster \
  --region us-east-1
```

### 3. Create IAM Roles

#### ECS Task Execution Role

```bash
# Create trust policy file: ecs-task-execution-trust-policy.json
cat > ecs-task-execution-trust-policy.json <<EOF
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

# Create role
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://ecs-task-execution-trust-policy.json

# Attach AWS managed policy
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# If using Secrets Manager, add additional policy
cat > secrets-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "kms:Decrypt"
      ],
      "Resource": "*"
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-name SecretsManagerAccess \
  --policy-document file://secrets-policy.json
```

### 4. Create ECS Task Definition

See `ecs-task-definition.json` template in this repository.

```bash
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json \
  --region us-east-1
```

### 5. Create ECS Service

```bash
aws ecs create-service \
  --cluster custom-itinerary-cluster \
  --service-name custom-itinerary-service \
  --task-definition custom-itinerary-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678],securityGroups=[sg-12345678],assignPublicIp=ENABLED}" \
  --region us-east-1
```

## Next.js Configuration for Docker

### Update `next.config.ts`

Add standalone output configuration:

```typescript
import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone', // Required for Docker deployment
  // ... other config
};

export default config;
```

## Deployment Workflow

### Automatic Deployment

1. **Push to `main` branch** → Triggers build and deploy to production
2. **Push to `develop` branch** → Triggers build only (no deploy)

### Manual Deployment

Run pipeline manually from GitLab:
1. Go to **CI/CD > Pipelines**
2. Click **Run Pipeline**
3. Select branch
4. Click **Run Pipeline**

## Pipeline Stages

### 1. Build Stage
- Builds Docker image using multi-stage build
- Tags image with commit SHA and `latest`
- Pushes to AWS ECR

### 2. Deploy Stage
- Fetches current ECS task definition
- Updates task definition with new image
- Registers new task definition revision
- Updates ECS service to use new revision
- Waits for service to stabilize

## Monitoring

### CloudWatch Logs

View application logs in AWS CloudWatch:
- Log Group: `/ecs/custom-itinerary-task`
- Stream: `ecs/custom-itinerary-container/{task-id}`

### ECS Service Events

```bash
aws ecs describe-services \
  --cluster custom-itinerary-cluster \
  --services custom-itinerary-service \
  --region us-east-1
```

## Troubleshooting

### Build Fails

- Check GitLab runner has Docker support
- Verify AWS credentials are correct
- Ensure ECR repository exists

### Deploy Fails

- Verify ECS cluster, service, and task definition exist
- Check IAM permissions for GitLab CI user
- Review CloudWatch logs for application errors

### Application Won't Start

- Verify all required environment variables are set in task definition
- Check container health checks
- Review CloudWatch logs for startup errors
- Ensure security groups allow inbound traffic on port 3000

### Secrets Not Loading

- Verify ECS Task Execution Role has `secretsmanager:GetSecretValue` permission
- Check secret ARNs are correct
- Ensure secrets exist in the same region as ECS

## Cost Optimization

### Development Environment

- Use Fargate Spot for non-production
- Scale down to 0 desired tasks when not in use
- Use smaller task sizes (0.5 vCPU, 1 GB memory)

### Production Environment

- Enable auto-scaling based on CPU/memory
- Use AWS Compute Savings Plans
- Monitor CloudWatch metrics to right-size tasks

## Security Best Practices

1. **Use AWS Secrets Manager** for all sensitive values
2. **Enable container insights** for monitoring
3. **Run tasks in private subnets** with NAT gateway
4. **Use Application Load Balancer** with HTTPS
5. **Enable AWS WAF** for additional protection
6. **Rotate secrets regularly**
7. **Use least-privilege IAM policies**
8. **Enable VPC Flow Logs**

## Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)

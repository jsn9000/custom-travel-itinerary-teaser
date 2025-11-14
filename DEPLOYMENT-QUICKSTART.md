# AWS ECS Deployment - Quick Start

## 🚀 Files Created

1. `.gitlab-ci.yml` - GitLab CI/CD pipeline
2. `Dockerfile` - Multi-stage Docker build
3. `.dockerignore` - Files to exclude from Docker build
4. `ecs-task-definition.json` - ECS task definition template
5. `DEPLOYMENT.md` - Complete deployment documentation
6. `next.config.ts` - Updated with `output: 'standalone'`

## ✅ Prerequisites Checklist

### AWS Setup
- [ ] AWS Account with appropriate permissions
- [ ] ECR Repository created: `custom-itinerary-travel`
- [ ] ECS Cluster created: `custom-itinerary-cluster`
- [ ] VPC with subnets and security groups
- [ ] IAM roles created (Task Execution Role, Task Role)
- [ ] CloudWatch Log Group: `/ecs/custom-itinerary-task`

### GitLab CI/CD Variables

Go to **GitLab > Settings > CI/CD > Variables** and add:

| Variable | Value | Masked | Protected |
|----------|-------|--------|-----------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key | ✅ | ✅ |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key | ✅ | ✅ |
| `AWS_ACCOUNT_ID` | Your 12-digit account ID | ❌ | ✅ |
| `AWS_DEFAULT_REGION` | `us-east-1` (or your region) | ❌ | ❌ |

### AWS Secrets Manager

Store these secrets in AWS Secrets Manager:

```bash
# OpenAI API Key
aws secretsmanager create-secret \
  --name openai-api-key \
  --secret-string '{"OPENAI_API_KEY":"sk-proj-your-key-here"}'

# Supabase Keys
aws secretsmanager create-secret \
  --name supabase-keys \
  --secret-string '{"NEXT_PUBLIC_SUPABASE_ANON_KEY":"your-key","SUPABASE_ANON_KEY":"your-key"}'

# Firecrawl API Key
aws secretsmanager create-secret \
  --name firecrawl-api-key \
  --secret-string '{"FIRECRAWL_API_KEY":"fc-your-key"}'

# Browserbase Keys
aws secretsmanager create-secret \
  --name browserbase-keys \
  --secret-string '{"BROWSERBASE_API_KEY":"bb_live_your-key","BROWSERBASE_PROJECT_ID":"your-project-id"}'

# Resend API Key
aws secretsmanager create-secret \
  --name resend-api-key \
  --secret-string '{"RESEND_API_KEY":"re_your-key"}'
```

## 📝 Required Environment Variables

### In ECS Task Definition (ecs-task-definition.json)

**CRITICAL - These MUST be configured:**

1. **OPENAI_API_KEY** - For AI features & description enhancement
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Client-side Supabase access
3. **SUPABASE_ANON_KEY** - Server-side Supabase access
4. **FIRECRAWL_API_KEY** - For Wanderlog scraping
5. **BROWSERBASE_API_KEY** - Alternative scraping method
6. **BROWSERBASE_PROJECT_ID** - Browserbase project ID
7. **RESEND_API_KEY** - Email functionality

**Optional (for enhanced features):**
- UNSPLASH_ACCESS_KEY
- PEXELS_API_KEY
- PIXABAY_API_KEY
- VECTORIZE_ACCESS_TOKEN
- VECTORIZE_ORG_ID
- VECTORIZE_PIPELINE_ID

## 🛠️ Setup Steps

### 1. Update Task Definition

Edit `ecs-task-definition.json`:
- Replace `YOUR_AWS_ACCOUNT_ID` with your actual AWS account ID (4 places)
- Update secret ARNs with your actual secret names/ARNs
- Adjust CPU/Memory if needed (current: 1 vCPU, 2 GB)

### 2. Create AWS Resources

```bash
# 1. Create ECR Repository
aws ecr create-repository --repository-name custom-itinerary-travel --region us-east-1

# 2. Create ECS Cluster
aws ecs create-cluster --cluster-name custom-itinerary-cluster --region us-east-1

# 3. Create CloudWatch Log Group
aws logs create-log-group --log-group-name /ecs/custom-itinerary-task --region us-east-1

# 4. Register Task Definition (after updating JSON)
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json --region us-east-1

# 5. Create ECS Service
aws ecs create-service \
  --cluster custom-itinerary-cluster \
  --service-name custom-itinerary-service \
  --task-definition custom-itinerary-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --region us-east-1
```

**Note:** Replace `subnet-xxxxx` and `sg-xxxxx` with your actual subnet and security group IDs.

### 3. Configure GitLab Variables

Add the required variables listed above to your GitLab project.

### 4. Deploy

```bash
# Push to main branch to trigger deployment
git add .
git commit -m "Add AWS ECS deployment configuration"
git push origin main
```

## 🔍 Verify Deployment

### Check Pipeline Status
```
GitLab → CI/CD → Pipelines
```

### Check ECS Service
```bash
aws ecs describe-services \
  --cluster custom-itinerary-cluster \
  --services custom-itinerary-service \
  --region us-east-1
```

### View Logs
```bash
aws logs tail /ecs/custom-itinerary-task --follow --region us-east-1
```

### Get Task Public IP
```bash
# Get running task ARN
TASK_ARN=$(aws ecs list-tasks \
  --cluster custom-itinerary-cluster \
  --service-name custom-itinerary-service \
  --region us-east-1 \
  --query 'taskArns[0]' \
  --output text)

# Get ENI ID
ENI_ID=$(aws ecs describe-tasks \
  --cluster custom-itinerary-cluster \
  --tasks $TASK_ARN \
  --region us-east-1 \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
  --output text)

# Get public IP
aws ec2 describe-network-interfaces \
  --network-interface-ids $ENI_ID \
  --query 'NetworkInterfaces[0].Association.PublicIp' \
  --output text
```

Access your app at: `http://<PUBLIC_IP>:3000`

## 🔒 Security Checklist

- [ ] All API keys stored in AWS Secrets Manager (not in task definition)
- [ ] ECS Task Execution Role has permissions to read secrets
- [ ] Security group allows inbound traffic on port 3000
- [ ] Consider using Application Load Balancer for HTTPS
- [ ] Enable AWS WAF for additional protection
- [ ] Use private subnets with NAT Gateway for production
- [ ] Enable VPC Flow Logs
- [ ] Rotate secrets regularly

## 📊 Cost Estimation

**Fargate Pricing (us-east-1):**
- 1 vCPU: ~$0.04048/hour
- 2 GB Memory: ~$0.004445/hour
- **Total per task:** ~$0.045/hour = ~$32.40/month (24/7)

**Additional Costs:**
- ECR storage: $0.10/GB/month
- Data transfer: $0.09/GB (first 10TB)
- CloudWatch Logs: $0.50/GB ingested
- NAT Gateway: ~$0.045/hour = ~$32.40/month (if used)

**Cost Optimization:**
- Use Fargate Spot (70% discount) for non-production
- Scale to 0 during off-hours for dev/test
- Right-size CPU/memory based on actual usage

## 🐛 Troubleshooting

### Build Fails
```bash
# Test build locally
docker build -t custom-itinerary-travel .
```

### Container Won't Start
```bash
# Check logs
aws logs tail /ecs/custom-itinerary-task --follow

# Check task status
aws ecs describe-tasks --cluster custom-itinerary-cluster --tasks <TASK_ARN>
```

### Can't Access Application
- Verify security group allows inbound on port 3000
- Check if task has public IP assigned
- Verify task is in RUNNING state

### Secrets Not Loading
- Verify Task Execution Role has `secretsmanager:GetSecretValue` permission
- Check secret ARNs in task definition are correct
- Ensure secrets exist in same region as ECS

## 📚 Additional Resources

- [Full Deployment Guide](./DEPLOYMENT.md)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)

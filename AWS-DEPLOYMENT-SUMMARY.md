# AWS ECS Fargate Deployment - Summary

## 📦 Files Created

| File | Purpose |
|------|---------|
| `.gitlab-ci.yml` | GitLab CI/CD pipeline configuration |
| `Dockerfile` | Multi-stage Docker build for Next.js app |
| `.dockerignore` | Excludes unnecessary files from Docker build |
| `ecs-task-definition.json` | AWS ECS task definition template |
| `setup-aws-secrets.sh` | Interactive script to create AWS secrets |
| `secrets-policy.json` | IAM policy for ECS to access secrets |
| `DEPLOYMENT.md` | Complete deployment guide |
| `DEPLOYMENT-QUICKSTART.md` | Quick start guide |
| `next.config.ts` | Updated with `output: 'standalone'` |

## 🔑 Required Environment Variables

### Critical (Must Configure)
1. **OPENAI_API_KEY** - AI features & description enhancement
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Client Supabase access
3. **SUPABASE_ANON_KEY** - Server Supabase access
4. **FIRECRAWL_API_KEY** - Wanderlog scraping
5. **BROWSERBASE_API_KEY** - Alternative scraping
6. **BROWSERBASE_PROJECT_ID** - Browserbase project
7. **RESEND_API_KEY** - Email functionality

### Optional (Enhanced Features)
- UNSPLASH_ACCESS_KEY, UNSPLASH_API_KEY
- PEXELS_API_KEY
- PIXABAY_API_KEY
- VECTORIZE_ACCESS_TOKEN, VECTORIZE_ORG_ID, VECTORIZE_PIPELINE_ID

## 🚀 Quick Deployment Steps

### 1. Configure GitLab Variables
Add to **GitLab > Settings > CI/CD > Variables**:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ACCOUNT_ID`
- `AWS_DEFAULT_REGION`

### 2. Create AWS Secrets
Run the setup script:
```bash
chmod +x setup-aws-secrets.sh
./setup-aws-secrets.sh
```

Or manually create secrets:
```bash
aws secretsmanager create-secret --name openai-api-key --secret-string '{"OPENAI_API_KEY":"sk-proj-..."}'
aws secretsmanager create-secret --name supabase-keys --secret-string '{"NEXT_PUBLIC_SUPABASE_ANON_KEY":"...","SUPABASE_ANON_KEY":"..."}'
# ... (see DEPLOYMENT-QUICKSTART.md for all)
```

### 3. Update Task Definition
Edit `ecs-task-definition.json`:
- Replace `YOUR_AWS_ACCOUNT_ID` (4 places)
- Update secret ARNs if needed

### 4. Create AWS Resources
```bash
# ECR Repository
aws ecr create-repository --repository-name custom-itinerary-travel --region us-east-1

# ECS Cluster
aws ecs create-cluster --cluster-name custom-itinerary-cluster --region us-east-1

# CloudWatch Log Group
aws logs create-log-group --log-group-name /ecs/custom-itinerary-task --region us-east-1

# IAM Role Policy (for secrets access)
aws iam put-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-name SecretsManagerAccess \
  --policy-document file://secrets-policy.json

# Register Task Definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json --region us-east-1

# Create ECS Service
aws ecs create-service \
  --cluster custom-itinerary-cluster \
  --service-name custom-itinerary-service \
  --task-definition custom-itinerary-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --region us-east-1
```

### 5. Deploy
```bash
git add .
git commit -m "Add AWS ECS deployment configuration"
git push origin main
```

## 🏗️ Architecture

```
┌─────────────┐
│   GitLab    │
│   CI/CD     │
└──────┬──────┘
       │ Push to main
       ↓
┌─────────────┐
│   Build     │
│   Docker    │
└──────┬──────┘
       │ Push image
       ↓
┌─────────────┐
│  AWS ECR    │
│  Registry   │
└──────┬──────┘
       │ Pull image
       ↓
┌─────────────┐      ┌──────────────┐
│  ECS Task   │ ←──→ │   Secrets    │
│  (Fargate)  │      │   Manager    │
└──────┬──────┘      └──────────────┘
       │
       ↓
┌─────────────┐
│ CloudWatch  │
│    Logs     │
└─────────────┘
```

## 💰 Cost Breakdown

**Fargate (us-east-1):**
- 1 vCPU: $0.04048/hour
- 2 GB Memory: $0.004445/hour
- **Monthly (24/7):** ~$32.40/month per task

**Additional Services:**
- ECR: $0.10/GB/month
- CloudWatch Logs: $0.50/GB ingested
- Data Transfer: $0.09/GB
- NAT Gateway (if used): ~$32.40/month

**Total Estimate:** $40-80/month (depending on usage)

## 🔒 Security Best Practices

✅ All secrets stored in AWS Secrets Manager (not in code)
✅ IAM roles with least-privilege permissions
✅ VPC with security groups configured
✅ CloudWatch logging enabled
✅ Container runs as non-root user
✅ Multi-stage Docker build (minimal attack surface)

**Recommended Enhancements:**
- [ ] Use private subnets with NAT Gateway
- [ ] Add Application Load Balancer with HTTPS
- [ ] Enable AWS WAF
- [ ] Configure auto-scaling
- [ ] Set up CloudWatch alarms
- [ ] Enable VPC Flow Logs
- [ ] Implement secret rotation

## 📊 Monitoring

### CloudWatch Logs
```bash
aws logs tail /ecs/custom-itinerary-task --follow --region us-east-1
```

### ECS Service Status
```bash
aws ecs describe-services \
  --cluster custom-itinerary-cluster \
  --services custom-itinerary-service \
  --region us-east-1
```

### Get Public IP
```bash
TASK_ARN=$(aws ecs list-tasks --cluster custom-itinerary-cluster --service-name custom-itinerary-service --query 'taskArns[0]' --output text)
ENI_ID=$(aws ecs describe-tasks --cluster custom-itinerary-cluster --tasks $TASK_ARN --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text)
aws ec2 describe-network-interfaces --network-interface-ids $ENI_ID --query 'NetworkInterfaces[0].Association.PublicIp' --output text
```

## 🐛 Common Issues

### Build Fails
- Check GitLab runner has Docker support
- Verify AWS credentials in GitLab CI/CD variables
- Ensure ECR repository exists

### Container Won't Start
- Check CloudWatch logs for errors
- Verify all secrets are created in AWS Secrets Manager
- Ensure Task Execution Role has secretsmanager permissions
- Confirm environment variables in task definition

### Can't Access App
- Verify security group allows inbound on port 3000
- Check task has public IP (if using public subnet)
- Ensure task is in RUNNING state

### Secrets Not Loading
- Verify secret ARNs in task definition are correct
- Check Task Execution Role has `secretsmanager:GetSecretValue` permission
- Ensure secrets exist in the same region as ECS

## 📚 Documentation

- **Quick Start:** See `DEPLOYMENT-QUICKSTART.md`
- **Full Guide:** See `DEPLOYMENT.md`
- **AWS ECS:** https://docs.aws.amazon.com/ecs/
- **GitLab CI/CD:** https://docs.gitlab.com/ee/ci/
- **Next.js Docker:** https://nextjs.org/docs/deployment#docker-image

## 🔄 CI/CD Pipeline Flow

1. **Trigger:** Push to `main` or `develop` branch
2. **Build Stage:**
   - Build Docker image
   - Tag with commit SHA and `latest`
   - Push to AWS ECR
3. **Deploy Stage (main only):**
   - Fetch current task definition
   - Update with new image tag
   - Register new task definition revision
   - Update ECS service
   - Wait for service to stabilize

## ✅ Verification Checklist

After deployment, verify:
- [ ] Pipeline completed successfully in GitLab
- [ ] Image exists in ECR repository
- [ ] ECS task is in RUNNING state
- [ ] CloudWatch logs showing application startup
- [ ] Application accessible via public IP:3000
- [ ] Health check passing (if configured)
- [ ] All API integrations working (Supabase, OpenAI, etc.)

## 🎯 Next Steps

1. **Production Enhancements:**
   - Set up Application Load Balancer with HTTPS
   - Configure custom domain with Route 53
   - Enable auto-scaling policies
   - Set up CloudWatch alarms
   - Implement CI/CD for staging environment

2. **Security Hardening:**
   - Move tasks to private subnets
   - Implement AWS WAF rules
   - Enable GuardDuty
   - Set up AWS Config compliance rules
   - Implement secret rotation

3. **Monitoring & Observability:**
   - Set up CloudWatch Dashboards
   - Configure X-Ray tracing
   - Implement custom metrics
   - Set up PagerDuty/SNS alerts

## 💡 Tips

- Use **Fargate Spot** for 70% cost savings in non-production
- Enable **Container Insights** for detailed metrics
- Use **AWS Compute Savings Plans** for production workloads
- Implement **blue/green deployments** for zero-downtime updates
- Set up **automated backups** for Supabase database
- Consider **CloudFront CDN** for static assets

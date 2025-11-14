# 🚀 AWS ECS Fargate Deployment - Complete Package

This package contains everything needed to deploy your Custom Itinerary Travel application to AWS ECS Fargate using GitLab CI/CD.

## 📁 What Was Created

### Core Deployment Files
| File | Description |
|------|-------------|
| `.gitlab-ci.yml` | GitLab CI/CD pipeline (build → push ECR → deploy ECS) |
| `Dockerfile` | Production-ready multi-stage Docker build |
| `.dockerignore` | Optimizes Docker build by excluding unnecessary files |
| `ecs-task-definition.json` | AWS ECS Fargate task configuration template |

### AWS Setup Helpers
| File | Description |
|------|-------------|
| `setup-aws-secrets.sh` | Interactive script to create all AWS secrets |
| `secrets-policy.json` | IAM policy for ECS to access Secrets Manager |

### Documentation
| File | Description |
|------|-------------|
| `DEPLOYMENT-QUICKSTART.md` | ⚡ Start here - Quick setup guide |
| `DEPLOYMENT.md` | 📖 Comprehensive deployment documentation |
| `AWS-DEPLOYMENT-SUMMARY.md` | 📊 Architecture, costs, monitoring |
| `README-DEPLOYMENT.md` | 📝 This file - overview |

### Updated Files
| File | Change |
|------|--------|
| `next.config.ts` | Added `output: 'standalone'` for Docker |

## 🎯 Quick Start (3 Steps)

### 1️⃣ Configure GitLab CI/CD Variables
Go to **GitLab → Settings → CI/CD → Variables** and add:

```
AWS_ACCESS_KEY_ID          → Your IAM access key (masked)
AWS_SECRET_ACCESS_KEY      → Your IAM secret key (masked)
AWS_ACCOUNT_ID             → Your 12-digit AWS account ID
AWS_DEFAULT_REGION         → us-east-1 (or your region)
```

### 2️⃣ Set Up AWS Resources
```bash
# Run the automated setup script
chmod +x setup-aws-secrets.sh
./setup-aws-secrets.sh

# Update task definition with your account ID
# Edit ecs-task-definition.json and replace YOUR_AWS_ACCOUNT_ID

# Create AWS infrastructure
aws ecr create-repository --repository-name custom-itinerary-travel --region us-east-1
aws ecs create-cluster --cluster-name custom-itinerary-cluster --region us-east-1
aws logs create-log-group --log-group-name /ecs/custom-itinerary-task --region us-east-1

# Register task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# Create ECS service (replace subnet/security group IDs)
aws ecs create-service \
  --cluster custom-itinerary-cluster \
  --service-name custom-itinerary-service \
  --task-definition custom-itinerary-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}"
```

### 3️⃣ Deploy
```bash
git add .
git commit -m "Add AWS ECS deployment configuration"
git push origin main
```

Watch your pipeline at: **GitLab → CI/CD → Pipelines**

## 🔑 Environment Variables Required

The application requires these environment variables (stored in AWS Secrets Manager):

### ✅ Critical (Must Have)
- `OPENAI_API_KEY` - AI features & description enhancement
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Client-side database access
- `SUPABASE_ANON_KEY` - Server-side database access
- `FIRECRAWL_API_KEY` - Wanderlog trip scraping
- `BROWSERBASE_API_KEY` - Alternative scraping method
- `BROWSERBASE_PROJECT_ID` - Browserbase project ID
- `RESEND_API_KEY` - Email functionality

### ⭐ Optional (Enhanced Features)
- `UNSPLASH_ACCESS_KEY`, `UNSPLASH_API_KEY` - Image search
- `PEXELS_API_KEY` - Image search
- `PIXABAY_API_KEY` - Image search
- `VECTORIZE_ACCESS_TOKEN`, `VECTORIZE_ORG_ID`, `VECTORIZE_PIPELINE_ID` - RAG features

## 🏗️ Architecture Overview

```
Developer Push → GitLab CI/CD → Docker Build → AWS ECR → ECS Fargate → Your App
                                                    ↓
                                            Secrets Manager
                                                    ↓
                                             CloudWatch Logs
```

**How It Works:**
1. Push code to `main` branch
2. GitLab builds Docker image
3. Image pushed to AWS ECR
4. ECS updates service with new image
5. Fargate runs containerized app
6. Secrets loaded from AWS Secrets Manager
7. Logs sent to CloudWatch

## 💰 Cost Estimate

**Monthly cost for 24/7 operation:**
- Fargate (1 vCPU, 2GB): ~$32/month
- ECR Storage: ~$1-5/month
- CloudWatch Logs: ~$5-10/month
- Data Transfer: ~$5-20/month
- **Total: $40-70/month**

**Cost Optimization:**
- Use Fargate Spot for 70% savings (non-production)
- Scale to 0 during off-hours
- Right-size CPU/memory based on usage

## 📊 What the Pipeline Does

### Build Stage (runs on `main` and `develop`)
1. Checkout code
2. Build Docker image with Turbopack
3. Tag image with commit SHA + `latest`
4. Push to AWS ECR

### Deploy Stage (only on `main`)
1. Fetch current ECS task definition
2. Update with new image reference
3. Register new task definition revision
4. Update ECS service
5. Wait for deployment to stabilize

## 🔍 Monitoring & Troubleshooting

### View Logs
```bash
aws logs tail /ecs/custom-itinerary-task --follow
```

### Check Service Status
```bash
aws ecs describe-services --cluster custom-itinerary-cluster --services custom-itinerary-service
```

### Get Application URL
```bash
# Get task public IP
TASK_ARN=$(aws ecs list-tasks --cluster custom-itinerary-cluster --service-name custom-itinerary-service --query 'taskArns[0]' --output text)
ENI_ID=$(aws ecs describe-tasks --cluster custom-itinerary-cluster --tasks $TASK_ARN --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text)
PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI_ID --query 'NetworkInterfaces[0].Association.PublicIp' --output text)

echo "Application URL: http://$PUBLIC_IP:3000"
```

### Common Issues

**Build Fails:**
- Verify AWS credentials in GitLab
- Check ECR repository exists
- Ensure GitLab runner has Docker

**Container Won't Start:**
- Check CloudWatch logs for errors
- Verify all secrets exist in Secrets Manager
- Confirm Task Execution Role has secretsmanager:GetSecretValue permission

**Can't Access App:**
- Verify security group allows port 3000
- Check task is RUNNING
- Ensure public IP assigned (if using public subnet)

## 🔒 Security Features

✅ **Secrets Management:** All API keys in AWS Secrets Manager (not in code)
✅ **IAM Roles:** Least-privilege access with specific permissions
✅ **Container Security:** Non-root user, multi-stage build
✅ **Network Security:** VPC, security groups, optional private subnets
✅ **Logging:** All container logs sent to CloudWatch

## 📚 Documentation Guide

**Start with:**
1. `DEPLOYMENT-QUICKSTART.md` - Follow this first for setup

**Reference:**
2. `DEPLOYMENT.md` - Detailed step-by-step guide
3. `AWS-DEPLOYMENT-SUMMARY.md` - Architecture, costs, best practices
4. This file - Overview

## 🎯 Production Checklist

Before going to production:
- [ ] Move to private subnets with NAT Gateway
- [ ] Add Application Load Balancer with HTTPS
- [ ] Configure custom domain (Route 53)
- [ ] Enable auto-scaling
- [ ] Set up CloudWatch alarms
- [ ] Enable AWS WAF
- [ ] Implement secret rotation
- [ ] Set up CloudWatch Dashboards
- [ ] Configure backup strategy
- [ ] Test disaster recovery

## 🆘 Need Help?

1. Check `DEPLOYMENT.md` troubleshooting section
2. Review CloudWatch logs
3. Verify AWS resource status
4. Check GitLab pipeline logs
5. Review security group and network configuration

## 🚦 Deployment Workflow

### Automatic
- **Push to `main`** → Build + Deploy to production
- **Push to `develop`** → Build only (no deploy)

### Manual
1. Go to GitLab → CI/CD → Pipelines
2. Click "Run Pipeline"
3. Select branch → Run

## 📈 Next Steps After Deployment

1. **Verify Deployment:**
   - Check ECS service is RUNNING
   - Access app via public IP
   - Test all features work

2. **Set Up Monitoring:**
   - Create CloudWatch Dashboard
   - Configure alarms for errors/CPU/memory
   - Set up SNS notifications

3. **Optimize:**
   - Monitor resource usage
   - Adjust CPU/memory if needed
   - Implement auto-scaling

4. **Secure:**
   - Add ALB with HTTPS
   - Configure WAF rules
   - Move to private subnets
   - Enable GuardDuty

## ✨ Features

- **Zero-downtime deployments** - ECS rolling updates
- **Automatic rollback** - On health check failures
- **Scalable** - Fargate auto-scales
- **Cost-effective** - Pay only for what you use
- **Secure** - Secrets never in code
- **Observable** - CloudWatch logging and metrics

---

**Ready to deploy?** Start with `DEPLOYMENT-QUICKSTART.md` 🚀

**Questions about costs?** See `AWS-DEPLOYMENT-SUMMARY.md` 💰

**Need detailed steps?** Check `DEPLOYMENT.md` 📖

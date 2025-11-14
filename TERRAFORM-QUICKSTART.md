# Terraform Quick Start Guide

## 🚀 Deploy AWS Infrastructure in 3 Steps

This guide will help you create all AWS resources for the Custom Itinerary Travel application using Terraform.

## Prerequisites

✅ AWS CLI configured with your credentials
✅ Terraform installed (v1.0+)
✅ This repository cloned

## Step 1: Initialize Terraform

```bash
cd terraform
terraform init
```

This downloads the AWS provider and prepares Terraform.

## Step 2: Deploy Infrastructure

```bash
terraform apply
```

Review the plan and type `yes` to confirm.

**What gets created:**
- ✅ ECR Repository for Docker images
- ✅ ECS Cluster (Fargate)
- ✅ ECS Task Definition
- ✅ Security Group (port 3000)
- ✅ IAM Roles
- ✅ CloudWatch Log Group

**Note:** The ECS service is NOT created yet (by design). You'll create it after setting up secrets.

## Step 3: Create Secrets

```bash
cd ..
./setup-aws-secrets.sh
```

Follow the prompts to enter your API keys:
- OpenAI API Key
- Supabase Keys
- Firecrawl API Key
- Browserbase Keys
- Resend API Key

## Step 4: Enable ECS Service

```bash
cd terraform
terraform apply -var="create_ecs_service=true"
```

This creates and starts the ECS service.

## ✅ Verify Deployment

### View Terraform Outputs
```bash
terraform output
```

Key outputs:
- `ecr_repository_url` - Push Docker images here
- `ecs_cluster_name` - Your cluster name
- `gitlab_ci_variables` - Add these to GitLab

### Check ECS Service Status
```bash
aws ecs describe-services \
  --cluster custom-itinerary-cluster \
  --services custom-itinerary-service
```

### View Application Logs
```bash
aws logs tail /ecs/custom-itinerary-task --follow
```

### Get Application URL
```bash
TASK_ARN=$(aws ecs list-tasks \
  --cluster custom-itinerary-cluster \
  --service-name custom-itinerary-service \
  --query 'taskArns[0]' --output text)

ENI_ID=$(aws ecs describe-tasks \
  --cluster custom-itinerary-cluster \
  --tasks $TASK_ARN \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
  --output text)

PUBLIC_IP=$(aws ec2 describe-network-interfaces \
  --network-interface-ids $ENI_ID \
  --query 'NetworkInterfaces[0].Association.PublicIp' \
  --output text)

echo "🎉 Application URL: http://$PUBLIC_IP:3000"
```

## 🔧 Configure GitLab CI/CD

After infrastructure is created, configure GitLab:

### 1. Get AWS Account ID
```bash
terraform output -raw aws_account_id
```

### 2. Add Variables to GitLab

Go to: **GitLab → Settings → CI/CD → Variables**

Add these variables:
- `AWS_ACCESS_KEY_ID` (your AWS access key, masked)
- `AWS_SECRET_ACCESS_KEY` (your AWS secret key, masked)
- `AWS_ACCOUNT_ID` (from terraform output above)
- `AWS_DEFAULT_REGION` = `us-east-1`

### 3. Deploy via GitLab

```bash
git push gitlab main
```

The GitLab pipeline will:
1. Build Docker image
2. Push to ECR
3. Update ECS service

## 📊 Default Configuration

The Terraform configuration uses these defaults:

| Resource | Default Value |
|----------|---------------|
| Region | `us-east-1` |
| ECR Repository | `custom-itinerary-travel` |
| ECS Cluster | `custom-itinerary-cluster` |
| ECS Service | `custom-itinerary-service` |
| Task CPU | `1024` (1 vCPU) |
| Task Memory | `2048` (2 GB) |
| Desired Count | `1` |

## ⚙️ Customizing Configuration

### Option 1: Command Line
```bash
terraform apply \
  -var="task_cpu=2048" \
  -var="task_memory=4096" \
  -var="desired_count=2"
```

### Option 2: Variables File
```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform apply
```

## 🔄 Common Operations

### Update Infrastructure
```bash
# Modify .tf files or terraform.tfvars
terraform apply
```

### Scale Service
```bash
terraform apply -var="desired_count=3"
```

### View State
```bash
terraform show
```

### List Resources
```bash
terraform state list
```

### Destroy Everything
```bash
terraform destroy
```

## 🐛 Troubleshooting

### "No default VPC found"
You need a VPC. Create one in AWS Console or modify `main.tf` to use a specific VPC.

### "Secrets not found" error
Run `../setup-aws-secrets.sh` to create secrets, then apply again.

### Task won't start
Check CloudWatch logs:
```bash
aws logs tail /ecs/custom-itinerary-task --follow
```

### Can't access application
Verify security group allows port 3000:
```bash
terraform output security_group_id
aws ec2 describe-security-groups --group-ids <security_group_id>
```

## 💰 Cost Breakdown

**Monthly cost estimate (24/7 operation):**
- Fargate (1 vCPU, 2GB): ~$32.40/month
- ECR storage: ~$1-5/month
- CloudWatch logs: ~$5-10/month
- Data transfer: ~$5-20/month
- **Total: ~$45-70/month**

**Cost optimization:**
- Use Fargate Spot (70% savings)
- Scale to 0 during off-hours
- Adjust CPU/memory based on actual usage

## 📋 Checklist

- [ ] AWS CLI configured (`aws configure`)
- [ ] Terraform installed (`terraform -v`)
- [ ] Run `terraform init`
- [ ] Run `terraform apply`
- [ ] Create secrets (`../setup-aws-secrets.sh`)
- [ ] Enable service (`terraform apply -var="create_ecs_service=true"`)
- [ ] Configure GitLab CI/CD variables
- [ ] Push code to trigger deployment
- [ ] Verify application is running

## 🎯 What's Next?

1. **Monitor your application:**
   ```bash
   aws logs tail /ecs/custom-itinerary-task --follow
   ```

2. **Set up auto-scaling** (optional):
   - Edit `main.tf` to add auto-scaling
   - Run `terraform apply`

3. **Add Application Load Balancer** (recommended for production):
   - For HTTPS and custom domain
   - See Terraform AWS ALB module

4. **Configure custom domain:**
   - Set up Route 53
   - Add SSL certificate (ACM)

## 📚 Resources

- **Full Terraform Guide:** `terraform/README.md`
- **Setup Script Help:** `./setup-aws-secrets.sh --help`
- **GitLab Variables:** `gitlab-ci-variables.txt`
- **Deployment Guide:** `DEPLOYMENT-QUICKSTART.md`

---

## 🎉 Quick Command Reference

```bash
# Deploy infrastructure
cd terraform && terraform init && terraform apply

# Create secrets
cd .. && ./setup-aws-secrets.sh

# Enable service
cd terraform && terraform apply -var="create_ecs_service=true"

# View logs
aws logs tail /ecs/custom-itinerary-task --follow

# Get outputs
terraform output

# Destroy everything
terraform destroy
```

---

**Your AWS infrastructure is ready!** 🚀

Next: Configure GitLab CI/CD and push your code!

# Terraform AWS ECS Infrastructure

This Terraform configuration creates all the AWS infrastructure needed to run the Custom Itinerary Travel application on ECS Fargate.

## 📦 What Gets Created

- **ECR Repository** - For Docker images
- **ECS Cluster** - Fargate cluster with Container Insights
- **ECS Task Definition** - Container configuration
- **ECS Service** - Manages running tasks (optional)
- **Security Group** - Allows inbound on port 3000
- **IAM Roles** - Task execution and task roles
- **CloudWatch Log Group** - For application logs

## 📋 Prerequisites

1. **AWS CLI** configured with credentials
   ```bash
   aws configure
   # Enter your AWS Access Key ID and Secret Access Key
   ```

2. **Terraform** installed (v1.0+)
   ```bash
   # macOS
   brew install terraform

   # Or download from https://www.terraform.io/downloads
   ```

3. **AWS Secrets** created (do this AFTER running Terraform)
   ```bash
   cd ..
   ./setup-aws-secrets.sh
   ```

## 🚀 Quick Start

### Step 1: Initialize Terraform

```bash
cd terraform
terraform init
```

### Step 2: Review the Plan

```bash
terraform plan
```

This shows you what will be created without making any changes.

### Step 3: Apply Configuration

```bash
terraform apply
```

Type `yes` when prompted to confirm.

**Note:** By default, the ECS service is NOT created initially. This allows you to create secrets first.

### Step 4: Create AWS Secrets

```bash
cd ..
./setup-aws-secrets.sh
```

### Step 5: Create ECS Service

Once secrets are created, enable the service:

```bash
cd terraform
terraform apply -var="create_ecs_service=true"
```

Or modify `terraform.tfvars` and set `create_ecs_service = true`, then run `terraform apply`.

## ⚙️ Configuration

### Using Default Values

The default configuration is ready to use for us-east-1:

```bash
terraform apply
```

### Customizing Configuration

1. Copy the example variables file:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. Edit `terraform.tfvars` with your preferences:
   ```hcl
   aws_region     = "us-east-1"
   task_cpu       = "1024"   # 1 vCPU
   task_memory    = "2048"   # 2 GB
   desired_count  = 1
   ```

3. Apply with your custom configuration:
   ```bash
   terraform apply
   ```

## 📊 Outputs

After `terraform apply`, you'll see important information:

```bash
# View all outputs
terraform output

# View specific output
terraform output ecr_repository_url
terraform output ecs_cluster_name
```

Key outputs:
- `ecr_repository_url` - Push Docker images here
- `ecs_cluster_name` - Your ECS cluster name
- `gitlab_ci_variables` - Variables to add to GitLab
- `next_steps` - What to do next

## 🔧 Common Commands

### View Current State
```bash
terraform show
```

### List Resources
```bash
terraform state list
```

### Update Infrastructure
```bash
# After modifying .tf files
terraform apply
```

### Destroy Everything
```bash
terraform destroy
```

**⚠️ Warning:** This deletes ALL resources created by Terraform!

## 📝 Variables Reference

### Required Variables (already set to defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `aws_region` | `us-east-1` | AWS region |
| `ecr_repository_name` | `custom-itinerary-travel` | ECR repo name |
| `ecs_cluster_name` | `custom-itinerary-cluster` | ECS cluster name |
| `ecs_service_name` | `custom-itinerary-service` | ECS service name |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `task_cpu` | `1024` | CPU units (1024 = 1 vCPU) |
| `task_memory` | `2048` | Memory in MB |
| `desired_count` | `1` | Number of tasks to run |
| `create_ecs_service` | `false` | Create ECS service immediately |
| `enable_container_insights` | `true` | Enable Container Insights |
| `log_retention_days` | `7` | CloudWatch log retention |

## 🔐 Security Configuration

### Secrets in AWS Secrets Manager

The task definition expects these secrets to exist:

1. `openai-api-key` - OpenAI API key
2. `supabase-keys` - Supabase anon keys
3. `firecrawl-api-key` - Firecrawl API key
4. `browserbase-keys` - Browserbase credentials
5. `resend-api-key` - Resend API key

Create them with:
```bash
cd ..
./setup-aws-secrets.sh
```

### IAM Permissions

Terraform automatically creates:
- **Task Execution Role** - Can pull images, read secrets, write logs
- **Task Role** - Application-level AWS permissions (currently minimal)

## 🌍 Multi-Region Deployment

To deploy in a different region:

```bash
terraform apply -var="aws_region=us-west-2"
```

Or set in `terraform.tfvars`:
```hcl
aws_region = "us-west-2"
```

## 📈 Scaling Configuration

### Vertical Scaling (More CPU/Memory)

Edit `terraform.tfvars`:
```hcl
task_cpu    = "2048"  # 2 vCPU
task_memory = "4096"  # 4 GB
```

Apply changes:
```bash
terraform apply
```

### Horizontal Scaling (More Tasks)

```hcl
desired_count = 3
```

## 🔄 State Management

### Local State (Default)

Terraform state is stored locally in `terraform.tfstate`.

**⚠️ Important:**
- Don't commit `terraform.tfstate` to git (it's in .gitignore)
- Back up this file - it's critical for managing infrastructure

### Remote State (Recommended for Teams)

For production or team environments, use S3 backend:

1. Create `backend.tf`:
   ```hcl
   terraform {
     backend "s3" {
       bucket         = "my-terraform-state-bucket"
       key            = "custom-itinerary/terraform.tfstate"
       region         = "us-east-1"
       encrypt        = true
       dynamodb_table = "terraform-state-lock"
     }
   }
   ```

2. Initialize backend:
   ```bash
   terraform init -migrate-state
   ```

## 🐛 Troubleshooting

### Error: "No default VPC found"

Create a VPC or modify `main.tf` to use a specific VPC:
```hcl
data "aws_vpc" "main" {
  id = "vpc-xxxxx"  # Your VPC ID
}
```

### Error: "Secrets not found"

Create secrets first:
```bash
cd ..
./setup-aws-secrets.sh
```

Then update the service:
```bash
terraform apply -var="create_ecs_service=true"
```

### Error: "Insufficient IAM permissions"

Ensure your AWS credentials have permissions for:
- ECR, ECS, IAM, CloudWatch, EC2, Secrets Manager

### Task fails to start

Check CloudWatch logs:
```bash
aws logs tail /ecs/custom-itinerary-task --follow
```

Common issues:
- Secrets not created
- Invalid secret ARNs
- Image not pushed to ECR

## 🔍 Verifying Deployment

### Check ECS Cluster
```bash
aws ecs describe-clusters --clusters custom-itinerary-cluster
```

### Check ECS Service
```bash
aws ecs describe-services \
  --cluster custom-itinerary-cluster \
  --services custom-itinerary-service
```

### View Logs
```bash
aws logs tail /ecs/custom-itinerary-task --follow
```

### Get Task Public IP
```bash
TASK_ARN=$(aws ecs list-tasks --cluster custom-itinerary-cluster --service-name custom-itinerary-service --query 'taskArns[0]' --output text)
ENI_ID=$(aws ecs describe-tasks --cluster custom-itinerary-cluster --tasks $TASK_ARN --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text)
PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI_ID --query 'NetworkInterfaces[0].Association.PublicIp' --output text)

echo "Application URL: http://$PUBLIC_IP:3000"
```

## 💰 Cost Estimate

**Monthly cost for 24/7 operation:**
- Fargate (1 vCPU, 2GB): ~$32/month
- ECR storage: ~$1-5/month
- CloudWatch: ~$5-10/month
- **Total: ~$40-50/month**

Reduce costs:
- Scale to 0 during off-hours
- Use Fargate Spot (70% discount)
- Adjust CPU/memory based on actual usage

## 🔄 CI/CD Integration

After Terraform deployment, configure GitLab:

1. Get outputs:
   ```bash
   terraform output gitlab_ci_variables
   ```

2. Add to GitLab (**Settings > CI/CD > Variables**):
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_ACCOUNT_ID` (from output)
   - `AWS_DEFAULT_REGION` (from output)

3. Push code to trigger deployment:
   ```bash
   git push gitlab main
   ```

## 📚 Additional Resources

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

## 🆘 Getting Help

1. Check Terraform output for errors
2. Review AWS CloudWatch logs
3. Verify all secrets are created
4. Check IAM permissions
5. Review security group rules

## 📋 Next Steps After Deployment

1. ✅ Create AWS Secrets (if not done): `../setup-aws-secrets.sh`
2. ✅ Enable ECS service: `terraform apply -var="create_ecs_service=true"`
3. ✅ Configure GitLab CI/CD variables
4. ✅ Push Docker image to ECR (or let GitLab do it)
5. ✅ Monitor deployment in CloudWatch

---

**Terraform Infrastructure Ready!** 🎉

See `../DEPLOYMENT-QUICKSTART.md` for complete deployment guide.

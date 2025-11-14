output "aws_account_id" {
  description = "AWS Account ID"
  value       = data.aws_caller_identity.current.account_id
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.app.repository_url
}

output "ecr_repository_arn" {
  description = "ARN of the ECR repository"
  value       = aws_ecr_repository.app.arn
}

output "ecs_cluster_id" {
  description = "ID of the ECS cluster"
  value       = aws_ecs_cluster.main.id
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = aws_ecs_cluster.main.arn
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_task_definition_arn" {
  description = "ARN of the ECS task definition"
  value       = aws_ecs_task_definition.app.arn
}

output "ecs_task_definition_family" {
  description = "Family name of the ECS task definition"
  value       = aws_ecs_task_definition.app.family
}

output "ecs_service_id" {
  description = "ID of the ECS service (if created)"
  value       = var.create_ecs_service ? aws_ecs_service.app[0].id : null
}

output "ecs_service_name" {
  description = "Name of the ECS service (if created)"
  value       = var.create_ecs_service ? aws_ecs_service.app[0].name : null
}

output "security_group_id" {
  description = "ID of the security group for ECS tasks"
  value       = aws_security_group.ecs_tasks.id
}

output "cloudwatch_log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.ecs.name
}

output "cloudwatch_log_group_arn" {
  description = "ARN of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.ecs.arn
}

output "task_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "task_role_arn" {
  description = "ARN of the ECS task role"
  value       = aws_iam_role.ecs_task.arn
}

output "vpc_id" {
  description = "ID of the VPC being used"
  value       = data.aws_vpc.default.id
}

output "subnet_ids" {
  description = "IDs of the subnets being used"
  value       = data.aws_subnets.default.ids
}

output "gitlab_ci_variables" {
  description = "GitLab CI/CD variables to configure"
  value = {
    AWS_ACCOUNT_ID       = data.aws_caller_identity.current.account_id
    AWS_DEFAULT_REGION   = var.aws_region
    ECR_REPOSITORY       = var.ecr_repository_name
    ECS_CLUSTER          = var.ecs_cluster_name
    ECS_SERVICE          = var.ecs_service_name
    ECS_TASK_DEFINITION  = var.ecs_task_family
  }
}

output "next_steps" {
  description = "Next steps after Terraform deployment"
  value = <<-EOT

  ✅ Infrastructure created successfully!

  Next Steps:

  1. Create AWS Secrets Manager secrets:
     cd .. && ./setup-aws-secrets.sh

  2. Configure GitLab CI/CD Variables:
     - AWS_ACCESS_KEY_ID (masked)
     - AWS_SECRET_ACCESS_KEY (masked)
     - AWS_ACCOUNT_ID: ${data.aws_caller_identity.current.account_id}
     - AWS_DEFAULT_REGION: ${var.aws_region}

  3. If you skipped ECS service creation, create it now:
     terraform apply -var="create_ecs_service=true"

  4. View logs:
     aws logs tail ${aws_cloudwatch_log_group.ecs.name} --follow

  5. Check service status:
     aws ecs describe-services --cluster ${var.ecs_cluster_name} --services ${var.ecs_service_name}

  6. Push code to GitLab to trigger deployment:
     git push gitlab main

  ECR Repository: ${aws_ecr_repository.app.repository_url}
  ECS Cluster: ${var.ecs_cluster_name}

  EOT
}

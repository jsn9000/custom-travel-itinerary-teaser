variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "custom-itinerary"
}

variable "ecr_repository_name" {
  description = "Name of the ECR repository"
  type        = string
  default     = "custom-itinerary-travel"
}

variable "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
  default     = "custom-itinerary-cluster"
}

variable "ecs_service_name" {
  description = "Name of the ECS service"
  type        = string
  default     = "custom-itinerary-service"
}

variable "ecs_task_family" {
  description = "Family name of the ECS task definition"
  type        = string
  default     = "custom-itinerary-task"
}

variable "container_name" {
  description = "Name of the container in the task definition"
  type        = string
  default     = "custom-itinerary-container"
}

variable "task_cpu" {
  description = "CPU units for the ECS task (1024 = 1 vCPU)"
  type        = string
  default     = "1024"
}

variable "task_memory" {
  description = "Memory for the ECS task in MB"
  type        = string
  default     = "2048"
}

variable "desired_count" {
  description = "Desired number of ECS tasks to run"
  type        = number
  default     = 1
}

variable "enable_container_insights" {
  description = "Enable CloudWatch Container Insights for the ECS cluster"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 7
}

variable "create_ecs_service" {
  description = "Whether to create the ECS service (set to false if secrets aren't created yet)"
  type        = bool
  default     = false
}

# Supabase Configuration
variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
  default     = "https://eaofdajkpqyddlbawdli.supabase.co"
}

variable "supabase_bucket" {
  description = "Supabase storage bucket name"
  type        = string
  default     = "wanderlog-edmonton-images"
}

variable "supabase_edge_function_url" {
  description = "Supabase Edge Function URL"
  type        = string
  default     = "https://eaofdajkpqyddlbawdli.functions.supabase.co/fetch-and-store-image"
}

# Tags
variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "custom-itinerary-travel"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

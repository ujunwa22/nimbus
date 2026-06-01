variable "nimbus_project" {
    description = "Project name prefix for ECR repositories"
    type = string
    default = "nimbus_ecr"
}

variable "nimbus_env" {
    description = "Environment name for ECR repositories"
    type = string
    default = "dev"
}

variable "tags" {
  description = "Tags for ECR repositories"
  type    = map(string)
  default = {}
}
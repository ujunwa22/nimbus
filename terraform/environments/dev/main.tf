terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state
  # Replace YOUR_ACCOUNT_ID with the output from bootstrap.sh
  backend "s3" {
    bucket         = "nimbus-terraform-state-541592468666-dev"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    use_lockfile = true 
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.tags
  }
}

#Locals
locals {
  project = "nimbus"
  env     = "dev"

  tags = {
    project      = "nimbus"
    environment  = local.env
    owner        = "your-team"
    cost-centre  = "edtech-001"
    managed-by   = "terraform"
  }
}

# ── VPC ───────────────────────────────────────────────────────
module "vpc" {
  source = "../../modules/vpc"

  project            = local.project
  env                = local.env
  vpc_cidr           = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b"]
  tags               = local.tags
}

# ── ECR ───────────────────────────────────────────────────────
module "ecr" {
  source = "../../modules/ecr"

  project = local.project
  env     = local.env
  tags    = local.tags
}

# ── Outputs ───────────────────────────────────────────────────
output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.vpc.private_subnet_ids
}

output "isolated_subnet_ids" {
  value = module.vpc.isolated_subnet_ids
}

output "backend_repo_url" {
  value = module.ecr.backend_repo_url
}

output "frontend_repo_url" {
  value = module.ecr.frontend_repo_url
}

#RDS
module "rds" {
  source = "../../modules/rds"

  project               = local.project
  env                   = local.env
  vpc_id                = module.vpc.vpc_id
  isolated_subnet_ids   = module.vpc.isolated_subnet_ids
  ecs_security_group_id = module.ecs.ecs_security_group_id
  db_password           = var.db_password
  tags                  = local.tags
}

#Secrets

module "secrets" {
  source = "../../modules/secrets"

  project     = local.project
  env         = local.env
  db_password = var.db_password
  jwt_secret  = var.jwt_secret
  tags        = local.tags
}

# IAM

module "iam" {
  source = "../../modules/iam"

  project        = local.project
  env            = local.env
  aws_account_id = var.aws_account_id
  github_repo    = var.github_repo
  tags           = local.tags
}

output "db_endpoint" {
  value     = module.rds.db_endpoint
  sensitive = true
}

output "ecs_execution_role_arn" {
  value = module.iam.ecs_execution_role_arn
}

output "ecs_task_role_arn" {
  value = module.iam.ecs_task_role_arn
}

output "github_actions_role_arn" {
  value = module.iam.github_actions_role_arn
}

output "db_password_arn" {
  value = module.secrets.db_password_arn
}

output "jwt_secret_arn" {
  value = module.secrets.jwt_secret_arn
}

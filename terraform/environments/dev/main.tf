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
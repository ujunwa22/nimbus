variable "project" {
  description = "Project name used in all resource names"
  type        = string
}

variable "env" {
  description = "Environment: dev or prod"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of AZs to deploy into (use 2)"
  type        = list(string)
}

variable "tags" {
  description = "Tags applied to every resource"
  type        = map(string)
  default     = {}
}
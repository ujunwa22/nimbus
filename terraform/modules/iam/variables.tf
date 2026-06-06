variable "project" {
  type = string
}

variable "env" {
  type = string
}

variable "aws_account_id" {
  type = string
}

variable "github_repo" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "aws_region"{
  type    = string
}
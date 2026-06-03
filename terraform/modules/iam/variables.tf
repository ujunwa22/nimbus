variable "project"             { type = string }
variable "env"                 { type = string }
variable "vpc_id"              { type = string }
variable "isolated_subnet_ids" { type = list(string) }
variable "ecs_security_group_id" { type = string }

variable "db_name" {
  type    = string
  default = "nimbus_db"
}

variable "db_username" {
  type    = string
  default = "nimbus_user"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_instance_class" {
  type    = string
  default = "db.t3.micro"
}

variable "allocated_storage" {
  type    = number
  default = 20
}

variable "tags" {
  type    = map(string)
  default = {}
}
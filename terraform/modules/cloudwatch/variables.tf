variable "project"                         { type = string }
variable "env"                             { type = string }
variable "aws_account_id"                  { type = string }
variable "aws_region"                      { type = string }
variable "alarm_email"                     { type = string }
variable "alb_arn_suffix"                  { type = string }
variable "backend_target_group_arn_suffix" { type = string }
variable "ecs_cluster_name"                { type = string }
variable "backend_service_name"            { type = string }
variable "db_instance_id"                  { type = string }
variable "tags"                            {
    type = map(string)
    default = {} 
 }
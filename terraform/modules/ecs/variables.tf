variable "project"                   { type = string }
variable "env"                       { type = string }
variable "aws_region"                { type = string }
variable "vpc_id"                    { type = string }
variable "private_subnet_ids"        { type = list(string) }
variable "alb_security_group_id"     { type = string }
variable "backend_target_group_arn"  { type = string }
variable "frontend_target_group_arn" { type = string }
variable "ecs_execution_role_arn"    { type = string }
variable "ecs_task_role_arn"         { type = string }
variable "backend_image"             { type = string }
variable "frontend_image"            { type = string }
variable "db_url_secret_arn"         { type = string }
variable "jwt_secret_arn"            { type = string }
variable "rds_security_group_id"     { type = string }
variable "alb_dns_name"              { type = string }
variable "image_tag"                 {
    type = string 
    default = "latest" 
}
variable "backend_cpu"               {
    type = number  
    default = 256 
}
variable "backend_memory"            {
    type = number 
    default = 512
}
variable "frontend_cpu"              { 
    type = number  
    default = 256 
    }
variable "frontend_memory"           { 
    type = number 
    default = 512 
}
variable "backend_desired_count"     {
    type = number  
    default = 2 
}
variable "frontend_desired_count"    {
    type = number 
    default = 2 
}
variable "backend_max_count"         { 
    type = number 
    default = 4 
}
variable "tags"                      {
    type = map(string) 
    default = {}
}

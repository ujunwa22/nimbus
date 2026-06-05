variable "project" {
  type = string
}

variable "env" {
  type = string
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "db_username" { 
  type = string  
  default = "nimbus_user" 
}
variable "db_host" {
   type = string 
}

variable "db_name" {
   type = string  
   default = "nimbus_db" 
}
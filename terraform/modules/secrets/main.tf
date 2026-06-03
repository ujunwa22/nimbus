# DB Password Secret

resource "aws_secretsmanager_secret" "db_password" {
  name                    = "${var.project}/${var.env}/db-password"
  description             = "Nimbus RDS master password"
  recovery_window_in_days = var.env == "prod" ? 7 : 0

  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = var.db_password
}

# JWT Secret

resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${var.project}/${var.env}/jwt-secret"
  description             = "Nimbus JWT signing secret"
  recovery_window_in_days = var.env == "prod" ? 7 : 0

  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = var.jwt_secret
}
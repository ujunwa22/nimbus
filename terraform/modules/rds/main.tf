# Security Group for RDS

resource "aws_security_group" "rds" {
  name        = "${var.project}-rds-sg-${var.env}"
  description = "Allow PostgreSQL from ECS only"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.ecs_security_group_id]
    description     = "PostgreSQL from ECS tasks only"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.project}-rds-sg-${var.env}"
  })
}


# Subnet Group

resource "aws_db_subnet_group" "main" {
  name       = "${var.project}-rds-subnet-${var.env}"
  subnet_ids = var.isolated_subnet_ids

  tags = merge(var.tags, {
    Name = "${var.project}-rds-subnet-${var.env}"
  })
}

# Parameter Group

resource "aws_db_parameter_group" "postgres" {
  name   = "${var.project}-pg-${var.env}"
  family = "postgres18"

  parameter {
    name  = "log_connections"
    value = "authentication"
  }

  tags = var.tags
}
# RDS Instance

resource "aws_db_instance" "postgres" {
  identifier = "${var.project}-db-${var.env}"

  engine         = "postgres"
  engine_version = "18"
  instance_class = var.db_instance_class

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.postgres.name

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.allocated_storage * 2
  storage_type          = "gp3"
  storage_encrypted     = true

  backup_retention_period = 1
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:06:00"

  deletion_protection    = false
  skip_final_snapshot    = false
  final_snapshot_identifier = "${var.project}-final-${var.env}"

  multi_az            = true
  publicly_accessible = false
  apply_immediately   = true

  tags = merge(var.tags, {
    Name = "${var.project}-db-${var.env}"
  })
}
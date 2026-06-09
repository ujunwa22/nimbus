# SNS Topic for Alarms

resource "aws_sns_topic" "alarms" {
  name = "${var.project}-alarms-${var.env}"
  tags = var.tags
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

# CloudWatch Dashboard — 7 Panels

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project}-dashboard-${var.env}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 8
        height = 6
        properties = {
          title   = "Request Rate"
          region  = var.aws_region 
          metrics = [["AWS/ApplicationELB", "RequestCount",
            "LoadBalancer", var.alb_arn_suffix]]
          period = 60
          stat   = "Sum"
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 0
        width  = 8
        height = 6
        properties = {
          title   = "5xx Error Rate"
          region  = var.aws_region
          metrics = [["AWS/ApplicationELB", "HTTPCode_Target_5XX_Count",
            "LoadBalancer", var.alb_arn_suffix]]
          period = 60
          stat   = "Sum"
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 0
        width  = 8
        height = 6
        properties = {
          title   = "p99 Latency"
          region  = var.aws_region
          metrics = [["AWS/ApplicationELB", "TargetResponseTime",
            "LoadBalancer", var.alb_arn_suffix]]
          period = 60
          stat   = "p99"
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 8
        height = 6
        properties = {
          title   = "ECS CPU Utilization"
          region  = var.aws_region
          metrics = [["AWS/ECS", "CPUUtilization",
            "ClusterName", var.ecs_cluster_name,
            "ServiceName", var.backend_service_name]]
          period = 60
          stat   = "Average"
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 6
        width  = 8
        height = 6
        properties = {
          title   = "ECS Memory Utilization"
          region  = var.aws_region
          metrics = [["AWS/ECS", "MemoryUtilization",
            "ClusterName", var.ecs_cluster_name,
            "ServiceName", var.backend_service_name]]
          period = 60
          stat   = "Average"
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 6
        width  = 8
        height = 6
        properties = {
          title   = "RDS Connections"
          region  = var.aws_region
          metrics = [["AWS/RDS", "DatabaseConnections",
            "DBInstanceIdentifier", var.db_instance_id]]
          period = 60
          stat   = "Average"
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 8
        height = 6
        properties = {
          title   = "ALB Healthy Host Count"
          region  = var.aws_region
          metrics = [["AWS/ApplicationELB", "HealthyHostCount",
            "LoadBalancer", var.alb_arn_suffix,
            "TargetGroup", var.backend_target_group_arn_suffix]]
          period = 60
          stat   = "Average"
          view   = "timeSeries"
        }
      }
    ]
  })
}

# Alarm 1 — High 5xx Error Rate

resource "aws_cloudwatch_metric_alarm" "high_error_rate" {
  alarm_name          = "${var.project}-high-error-rate-${var.env}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "5xx errors exceeded threshold"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  tags = var.tags
}


# Alarm 2 — ECS Task Count Drop

resource "aws_cloudwatch_metric_alarm" "ecs_task_count" {
  alarm_name          = "${var.project}-ecs-task-drop-${var.env}"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "RunningTaskCount"
  namespace           = "ECS/ContainerInsights"
  period              = 60
  statistic           = "Average"
  threshold           = 1
  alarm_description   = "ECS task count dropped below minimum"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "breaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.backend_service_name
  }

  tags = var.tags
}


# Alarm 3 — High p99 Latency

resource "aws_cloudwatch_metric_alarm" "high_latency" {
  alarm_name          = "${var.project}-high-latency-${var.env}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  extended_statistic  = "p99"
  threshold           = 2
  alarm_description   = "p99 latency exceeded 2 seconds"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  tags = var.tags
}


# Alarm 4 — RDS High Connections

resource "aws_cloudwatch_metric_alarm" "rds_connections" {
  alarm_name          = "${var.project}-rds-connections-${var.env}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "RDS connections near limit"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    DBInstanceIdentifier = var.db_instance_id
  }

  tags = var.tags
}


# X-Ray Group

resource "aws_xray_group" "main" {
  group_name        = "${var.project}-${var.env}"
  filter_expression = "service(\"nimbus-backend\")"
  tags              = var.tags
}


# CloudTrail S3 Bucket

resource "aws_s3_bucket" "cloudtrail" {
  bucket        = "${var.project}-cloudtrail-${var.aws_account_id}-${var.env}"
  force_destroy = true
  tags          = var.tags
}

resource "aws_s3_bucket_versioning" "cloudtrail" {
  bucket = aws_s3_bucket.cloudtrail.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "cloudtrail" {
  bucket                  = aws_s3_bucket.cloudtrail.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "cloudtrail" {
  bucket = aws_s3_bucket.cloudtrail.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSCloudTrailAclCheck"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = aws_s3_bucket.cloudtrail.arn
      },
      {
        Sid    = "AWSCloudTrailWrite"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.cloudtrail.arn}/AWSLogs/${var.aws_account_id}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      }
    ]
  })
}


# CloudTrail

resource "aws_cloudtrail" "main" {
  name                          = "${var.project}-trail-${var.env}"
  s3_bucket_name                = aws_s3_bucket.cloudtrail.id
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_log_file_validation    = true

  tags = var.tags

  depends_on = [aws_s3_bucket_policy.cloudtrail]
}


# AWS Config — 5 Rules

resource "aws_config_configuration_recorder" "main" {
  name     = "${var.project}-recorder-${var.env}"
  role_arn = aws_iam_role.config.arn

  recording_group {
    all_supported                 = true
    include_global_resource_types = true
  }
}

resource "aws_s3_bucket" "config" {
  bucket        = "${var.project}-config-${var.aws_account_id}-${var.env}"
  force_destroy = true
  tags          = var.tags
}

resource "aws_s3_bucket_public_access_block" "config" {
  bucket                  = aws_s3_bucket.config.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_iam_role" "config" {
  name = "${var.project}-config-role-${var.env}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "config.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
  tags = var.tags
}
resource "aws_iam_role_policy" "config" {
  name = "${var.project}-config-policy-${var.env}"
  role = aws_iam_role.config.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:PutObject",
          "s3:GetBucketAcl",
          "s3:ListBucket"
        ],
        Resource = [
          aws_s3_bucket.config.arn,
          "${aws_s3_bucket.config.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "config" {
  role       = aws_iam_role.config.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWS_ConfigRole"
}

resource "aws_config_delivery_channel" "main" {
  name           = "${var.project}-delivery-${var.env}"
  s3_bucket_name = aws_s3_bucket.config.bucket
  s3_key_prefix  = "aws-config"
  depends_on     = [aws_config_configuration_recorder.main]
}

resource "aws_config_configuration_recorder_status" "main" {
  name       = aws_config_configuration_recorder.main.name
  is_enabled = true
  depends_on = [aws_config_delivery_channel.main]
}

# Config Rule 1 — EBS encryption
resource "aws_config_config_rule" "encrypted_volumes" {
  name        = "${var.project}-encrypted-volumes-${var.env}"
  description = "EBS volumes must be encrypted"

  source {
    owner             = "AWS"
    source_identifier = "ENCRYPTED_VOLUMES"
  }

  depends_on = [aws_config_configuration_recorder_status.main]
  tags       = var.tags
}

# Config Rule 2 — RDS encryption
resource "aws_config_config_rule" "rds_encrypted" {
  name        = "${var.project}-rds-storage-encrypted-${var.env}"
  description = "RDS storage must be encrypted"

  source {
    owner             = "AWS"
    source_identifier = "RDS_STORAGE_ENCRYPTED"
  }

  depends_on = [aws_config_configuration_recorder_status.main]
  tags       = var.tags
}

# Config Rule 3 — No inline IAM policies
resource "aws_config_config_rule" "iam_no_inline" {
  name        = "${var.project}-iam-no-inline-policy-${var.env}"
  description = "IAM roles must not have inline policies"

  source {
    owner             = "AWS"
    source_identifier = "IAM_NO_INLINE_POLICY_CHECK"
  }

  depends_on = [aws_config_configuration_recorder_status.main]
  tags       = var.tags
}

# Config Rule 4 — No public SSH
resource "aws_config_config_rule" "restricted_ssh" {
  name        = "${var.project}-restricted-ssh-${var.env}"
  description = "Security groups must not allow public SSH"

  source {
    owner             = "AWS"
    source_identifier = "INCOMING_SSH_DISABLED"
  }

  depends_on = [aws_config_configuration_recorder_status.main]
  tags       = var.tags
}

# Config Rule 5 — No public S3
resource "aws_config_config_rule" "s3_no_public" {
  name        = "${var.project}-s3-public-prohibited-${var.env}"
  description = "S3 buckets must not be publicly readable"

  source {
    owner             = "AWS"
    source_identifier = "S3_BUCKET_PUBLIC_READ_PROHIBITED"
  }

  depends_on = [aws_config_configuration_recorder_status.main]
  tags       = var.tags
}
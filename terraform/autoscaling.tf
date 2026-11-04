# Recurso: Auto Scaling Group que crea y administra instancias (backend-app).
resource "aws_autoscaling_group" "backend_app" {
  name                = "${var.prefix}-asg-backend-app"
  min_size            = 1
  desired_capacity    = 1
  max_size            = 2
  vpc_zone_identifier = [aws_subnet.public.id, aws_subnet.public_b.id]
  target_group_arns   = [aws_lb_target_group.backend_app.arn]

  launch_template {
    id      = aws_launch_template.backend_app.id
    version = aws_launch_template.backend_app.latest_version
  }

  health_check_type         = "ELB"
  health_check_grace_period = 1000
  default_instance_warmup   = 1000

  enabled_metrics = [
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupPendingInstances",
    "GroupTotalInstances"
  ]


  tag {
    key                 = "Name"
    value               = "${var.prefix}-backend-app"
    propagate_at_launch = true
  }

  tag {
    key                 = "ManagedBy"
    value               = "Terraform"
    propagate_at_launch = true
  }
}
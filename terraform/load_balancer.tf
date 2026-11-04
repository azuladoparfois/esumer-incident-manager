# Recurso: Target Group que registra servidores y realiza health checks (backend-app).
resource "aws_lb_target_group" "backend_app" {
  name        = "${var.prefix}-tg-backend-app"
  port        = 3000
  protocol    = "HTTP"
  target_type = "instance"
  vpc_id      = aws_vpc.main.id

}

# Recurso: Application Load Balancer de acceso público (backend-app).
resource "aws_lb" "backend_app" {
  name                       = "${var.prefix}-alb-backend-app"
  internal                   = false
  load_balancer_type         = "application"
  security_groups            = [aws_security_group.alb.id]
  subnets                    = [aws_subnet.public.id, aws_subnet.public_b.id]
  enable_deletion_protection = false

  tags = { Name = "${var.prefix}-alb-backend-app" }
}

# Recurso: Listener que recibe tráfico HTTP y lo reenvía al Target Group (http).
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.backend_app.arn
  port              = 3000
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_app.arn
  }
}
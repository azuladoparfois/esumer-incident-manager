# Recurso: Security Group: reglas de seguridad para ALB o EC2 (alb).
resource "aws_security_group" "alb" {
  name        = "${var.prefix}-sg-alb"
  description = "HTTP publico hacia el balanceador"
  vpc_id      = aws_vpc.main.id
  tags        = { Name = "${var.prefix}-sg-alb" }
}

# Recurso: Regla de entrada: quién puede acceder al servicio (alb_http).
resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  security_group_id = aws_security_group.alb.id
  description       = "HTTP publico (solo laboratorio)"
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 3000
  to_port           = 3000
  ip_protocol       = "tcp"
}

# Recurso: Regla de salida: tráfico permitido hacia otros destinos (alb_out).
resource "aws_vpc_security_group_egress_rule" "alb_out" {
  security_group_id = aws_security_group.alb.id
  description       = "Permite responder y hablar con destinos"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

# Recurso: Security Group: reglas de seguridad para ALB o EC2 (app).
resource "aws_security_group" "backend_app" {
  name        = "${var.prefix}-sg-backend-app"
  description = "HTTP solo desde el SG del ALB"
  vpc_id      = aws_vpc.main.id
  tags        = { Name = "${var.prefix}-sg-backend-app" }
}

# Recurso: Regla de entrada: quién puede acceder al servicio (app_http_from_alb).
resource "aws_vpc_security_group_ingress_rule" "backend_app_http_from_alb" {
  security_group_id            = aws_security_group.backend_app.id
  description                  = "HTTP desde el balanceador"
  referenced_security_group_id = aws_security_group.alb.id
  from_port                    = 3000
  to_port                      = 3000
  ip_protocol                  = "tcp"
}

# Recurso: Regla de entrada: quién puede acceder al servicio (app_http_from_alb).
resource "aws_vpc_security_group_ingress_rule" "backend_app_ssh_from_my_ip" {
  security_group_id = aws_security_group.backend_app.id
  description       = "SSH desde mi computador"
  cidr_ipv4         = "37.10.70.138/32"
  from_port         = 22
  to_port           = 22
  ip_protocol       = "tcp"
}


# Recurso: Regla de salida: tráfico permitido hacia otros destinos (app_out).
resource "aws_vpc_security_group_egress_rule" "app_out" {
  security_group_id = aws_security_group.backend_app.id
  description       = "Salida para instalar Docker, imageness y actualizar"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}
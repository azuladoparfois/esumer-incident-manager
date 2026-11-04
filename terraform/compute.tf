# Consulta: Consulta de una AMI oficial existente (ubuntu).
data "aws_ami" "ubuntu" {
  # Elegir la imagen más reciente que cumpla todos los filtros siguientes.
  most_recent = true
  # Restringir la búsqueda a Canonical para evitar AMI de terceros.
  owners = ["099720109477"] # Canonical

  # Seleccionar Ubuntu 26.04 (Resolute), AMD64 y el patrón oficial de Canonical.
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-resolute-26.04-amd64-server-*"]
  }

  # Exigir virtualización HVM, compatible con las instancias EC2 modernas.
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  # Exigir que la AMI tenga su volumen raíz respaldado por Amazon EBS.
  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }
}

# Recurso: Plantilla que define cómo se lanzarán las instancias EC2 (backend-app).
resource "aws_launch_template" "backend_app" {
  depends_on    = [aws_iam_role_policy.backend_app_secrets]
  name          = "${var.prefix}-lt-backend-app"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = "esumer-linux-key"
  # Hacer predeterminada la versión más nueva si Terraform modifica la plantilla.
  update_default_version = true
  # path.module apunta a la carpeta donde están los archivos .tf de este módulo.
  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    aws_region_b64     = base64encode(var.aws_region)
    mongo_user_b64     = base64encode(aws_secretsmanager_secret.mongo_user.arn)
    mongo_password_b64 = base64encode(aws_secretsmanager_secret.mongo_password.arn)
  }))

  iam_instance_profile {
    name = aws_iam_instance_profile.backend_app.name
  }

  # Configurar la interfaz de red principal de las EC2 futuras.
  network_interfaces {
    # Índice 0 = interfaz de red principal (eth0).
    device_index = 0
    # Asignar IP pública en este laboratorio para tener salida a Internet sin NAT.
    associate_public_ip_address = true
    # Eliminar esta interfaz de red cuando termine la instancia.
    delete_on_termination = true
    # Aplicar el Security Group de App: HTTP solo desde el ALB.
    security_groups = [aws_security_group.backend_app.id]
  }

  # Instance Metadata Service (IMDS): permite consultar metadatos de la EC2
  # como su ID, datos de red o credenciales temporales de un rol IAM, si lo tiene.
  metadata_options {
    # Mantener habilitado el endpoint LOCAL de metadatos (169.254.169.254).
    http_endpoint = "enabled"
    # Exigir que cada solicitud incluya un token de sesión IMDSv2 válido.
    # Evita el acceso sin token propio de IMDSv1; es una medida de hardening.
    http_tokens = "required"
  }

  # Definir el disco raíz de las EC2 creadas desde la plantilla.
  block_device_mappings {
    # Nombre del dispositivo raíz esperado por la AMI seleccionada.
    device_name = "/dev/sda1"
    ebs {
      # Disco de 10 GiB (revisar espacio libre en la práctica).
      volume_size = 40
      # gp3 = volumen SSD EBS de propósito general.
      volume_type = "gp3"
      # Cifrar el volumen EBS en reposo.
      encrypted = true
      # Eliminar el volumen al destruir la EC2 para evitar recursos y costos residuales.
      delete_on_termination = true
    }
  }

  tag_specifications {
    resource_type = "instance"
    tags          = { Name = "${var.prefix}-backend-app" }
  }

  tags = { Name = "${var.prefix}-lt-backend-app" }
}

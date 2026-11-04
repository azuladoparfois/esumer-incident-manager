# Configura el proveedor AWS usando la región y etiquetas predeterminadas.
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "ESUMER"
      Class     = "Masterclass"
      ManagedBy = "Terraform"
    }
  }
}
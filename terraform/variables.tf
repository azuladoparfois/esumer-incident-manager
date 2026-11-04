# Variable de entrada: aws_region.
variable "aws_region" {
  description = "Región del laboratorio"
  type        = string
  default     = "us-east-2"
}

# Variable de entrada: prefix.
variable "prefix" {
  description = "Prefijo para no chocar con la clase anterior"
  type        = string
  default     = "masterclass-tf"
}

# Variable de entrada: instance_type.
variable "instance_type" {
  description = "Tipo EC2 disponible en la cuenta y región"
  type        = string
  default     = "c7i-flex.large"
}
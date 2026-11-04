# Los valores se cargan por separado, sin guardarlos en el estado de Terraform.
resource "aws_secretsmanager_secret" "mongo_user" {
  name = "${var.prefix}/MONGO_USER"
}
resource "aws_secretsmanager_secret" "mongo_password" {
  name = "${var.prefix}/MONGO_PASSWORD"
}
data "aws_iam_policy_document" "backend_app_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}
resource "aws_iam_role" "backend_app" {
  name               = "${var.prefix}-backend-app"
  assume_role_policy = data.aws_iam_policy_document.backend_app_assume_role.json
}
data "aws_iam_policy_document" "backend_app_secrets" {
  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [aws_secretsmanager_secret.mongo_user.arn, aws_secretsmanager_secret.mongo_password.arn]
  }
}
resource "aws_iam_role_policy" "backend_app_secrets" {
  name   = "read-mongodb-secrets"
  role   = aws_iam_role.backend_app.id
  policy = data.aws_iam_policy_document.backend_app_secrets.json
}
resource "aws_iam_instance_profile" "backend_app" {
  name = "${var.prefix}-backend-app"
  role = aws_iam_role.backend_app.name
}

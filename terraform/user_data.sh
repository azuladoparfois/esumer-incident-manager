#!/bin/bash
# cloud-init ejecuta este script como root.
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git unzip python3
curl -fsSL https://get.docker.com -o /tmp/install-docker.sh
sh /tmp/install-docker.sh

# AWS CLI usa las credenciales temporales del rol de la instancia.
curl -fsSL https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install

git clone https://github.com/azuladoparfois/esumer-incident-manager.git /opt/esumer-incident-manager

# No imprimir las credenciales en los logs de cloud-init.
umask 077
python3 - '${aws_region_b64}' '${mongo_user_b64}' '${mongo_password_b64}' <<'PY'
import base64
import json
import shlex
import subprocess
import sys
from urllib.parse import quote

region, user_arn, password_arn = (base64.b64decode(value).decode() for value in sys.argv[1:])
values = {}
for name, arn in (("MONGO_USER", user_arn), ("MONGO_PASSWORD", password_arn)):
    result = subprocess.check_output([
        "/usr/local/bin/aws", "secretsmanager", "get-secret-value",
        "--region", region, "--secret-id", arn, "--output", "json",
    ])
    values[name] = json.loads(result)["SecretString"]

# Compose usa los originales para MongoDB y los codificados para construir la URI.
values.update({f"{name}_URI": quote(value, safe="") for name, value in values.items()})
with open("/etc/esumer-mongo.env", "w", encoding="utf-8") as env_file:
    for name, value in values.items():
        env_file.write(f"export {name}={shlex.quote(value)}\n")
PY

# Permitir leer las variables a root y al usuario ubuntu de la AMI.
chown root:ubuntu /etc/esumer-mongo.env
chmod 0640 /etc/esumer-mongo.env

# Exportarlas automáticamente en las sesiones de login (SSH o sudo -i).
cat > /etc/profile.d/esumer-mongo.sh <<'PROFILE'
if [ -r /etc/esumer-mongo.env ]; then
    . /etc/esumer-mongo.env
fi
PROFILE
chmod 0644 /etc/profile.d/esumer-mongo.sh

# Disponibles también para los comandos posteriores de este user_data.
source /etc/esumer-mongo.env

cd /opt/esumer-incident-manager
docker compose up -d --build

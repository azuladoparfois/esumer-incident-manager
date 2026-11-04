# Secretos de MongoDB en EC2

Terraform crea dos secretos de Secrets Manager, `${prefix}/MONGO_USER` y
`${prefix}/MONGO_PASSWORD`, sin crear sus valores. Esto evita guardar las
credenciales en el estado de Terraform. Antes de iniciar instancias, cree los
secretos y cargue una versión de texto en cada uno desde la consola de AWS:

```bash
terraform init
terraform apply -target=aws_secretsmanager_secret.mongo_user -target=aws_secretsmanager_secret.mongo_password
```

En Secrets Manager, en la misma región configurada en `aws_region`, agregue un
valor de texto sin formato a cada secreto. Después ejecute `terraform apply`
normalmente. El despliegue inicial debe hacerse en este orden porque el grupo
Auto Scaling crea una instancia inmediatamente. La instancia necesita acceso
HTTPS a GitHub, a los sitios de instalación y a Secrets Manager.

El arranque clona el repositorio en `/opt/esumer-incident-manager` y escribe
las credenciales en `/etc/esumer-mongo.env`, legible por root y el grupo ubuntu.
`/etc/profile.d/esumer-mongo.sh` las exporta automáticamente al entrar por SSH
o iniciar una sesión con `sudo -i`. No se genera un `.env` en el repositorio.
También se exportan las versiones codificadas para URL (`MONGO_USER_URI` y
`MONGO_PASSWORD_URI`). Compose usa
estas últimas para construir la URI con la base `esumer_incidents` y la base
de autenticación `admin`. Para iniciar Compose:

```bash
sudo -i
cd /opt/esumer-incident-manager
docker compose up -d --build
```

Un `export` no es global para todo EC2: los servicios y comandos que no abran
una sesión de login deben cargar explícitamente `/etc/esumer-mongo.env` antes
de arrancar. En una sesión ya abierta, use `source /etc/esumer-mongo.env`.

El script inicia Compose automáticamente con `docker compose up -d --build`
después de cargar las variables. Para ejecutar Compose fuera de EC2, configure en
`.env` las cuatro variables mencionadas: las dos credenciales originales y sus
versiones codificadas para URL. Los secretos se leen durante el
arranque: cambiar sus valores requiere actualizar o reemplazar las instancias.
Actualizar la plantilla no reemplaza automáticamente instancias existentes.

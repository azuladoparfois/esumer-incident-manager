# ESUMER Incident Manager

API REST didáctica para registrar y gestionar incidencias de TI. Incluye CRUD, filtros, paginación, comprobaciones de salud y documentación interactiva OpenAPI. La infraestructura y el despliegue forman parte del laboratorio y no se incluyen aquí.

## Requisitos

- Node.js 24 LTS y npm.
- MongoDB accesible localmente o por red. La conexión debe tener permisos de lectura y escritura sobre la base indicada. Si se usa un servidor remoto, configure sus reglas de red y credenciales según corresponda; no guarde secretos en el repositorio.

## Instalación y configuración

```bash
npm install
cp .env.example .env
```

Edite `.env`:

- `PORT`: puerto HTTP, por defecto `3000`.
- `MONGODB_URI`: URI de MongoDB, por ejemplo `mongodb://127.0.0.1:27017/esumer_incidents`. Puede apuntar a otra máquina o usar una URI de MongoDB compatible con su instalación.
- `CORS_ORIGIN`: uno o varios orígenes explícitos separados por comas, por ejemplo `http://localhost:5173,https://frontend.example.com`, sin barras finales. CORS controla el acceso desde navegadores; no es autenticación.

La aplicación intenta conectarse a MongoDB antes de abrir el puerto. Si la conexión inicial falla, termina con error; si posteriormente MongoDB deja de estar disponible, `/health/ready` devuelve 503. Al recibir SIGINT o SIGTERM cierra el servidor y la conexión.

```bash
npm run dev  # reinicia al cambiar archivos
npm start    # inicio normal
```

Visite `http://localhost:3000/api-docs` para explorar y ejecutar peticiones con **Try it out**, o `http://localhost:3000/openapi.json` para obtener el documento OpenAPI 3. La documentación usa el mismo origen que la API.

## Pruebas

```bash
npm test
```

Las pruebas utilizan el ejecutor incorporado de Node y Supertest, con un servicio simulado: no requieren MongoDB, credenciales ni servicios externos. Comprueban el contrato HTTP, pero no sustituyen una prueba de integración con MongoDB real. Para verificar la integración, arranque MongoDB, configure `.env`, inicie el servidor y ejecute los ejemplos siguientes.

## Datos ficticios

```bash
npm run seed
```

Inserta cinco incidencias adicionales en la base configurada cada vez que se ejecuta; no borra datos y no se ejecuta al iniciar el servidor.

## Ejemplos de uso

```bash
curl -s http://localhost:3000/health/live
curl -s http://localhost:3000/health/ready
curl -s -X POST http://localhost:3000/api/incidents \
  -H 'Content-Type: application/json' \
  -d '{"title":"Fallo de conectividad","description":"La oficina no puede acceder a la red interna","category":"network","priority":"high"}'
curl -s 'http://localhost:3000/api/incidents?status=open&page=1&limit=10'
```

Copie el `id` obtenido al crear una incidencia y sustitúyalo en los siguientes comandos:

```bash
curl -s http://localhost:3000/api/incidents/ID
curl -s -X PATCH http://localhost:3000/api/incidents/ID -H 'Content-Type: application/json' -d '{"status":"resolved"}'
curl -i -X DELETE http://localhost:3000/api/incidents/ID
```

`title` y `description` son obligatorios; los valores por defecto son `other`, `medium` y `open`. La lista devuelve `items` y `pagination` (página inicial 1, límite predeterminado 10 y máximo 100). Un identificador malformado produce 400, uno válido pero inexistente 404, y los datos o filtros inválidos 422. La especificación describe las restricciones y todas las respuestas.


# Test de GitFlow

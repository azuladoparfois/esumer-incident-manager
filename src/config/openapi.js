const example = { id: '507f1f77bcf86cd799439011', title: 'Interrupción de conectividad', description: 'Los equipos del área de soporte no pueden acceder a la red interna.', category: 'network', priority: 'high', status: 'open', createdAt: '2026-01-15T10:00:00.000Z', updatedAt: '2026-01-15T10:00:00.000Z' };
const error = (message, description) => ({ description, content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' }, example: { error: { message } } } } });
const json = schema => ({ 'application/json': { schema } });
const ref = name => ({ $ref: `#/components/schemas/${name}` });
const id = { name: 'id', in: 'path', required: true, description: 'Identificador hexadecimal de MongoDB', schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }, example: example.id };
const invalid = error('Datos inválidos', 'Datos o parámetros de consulta inválidos');
const badId = error('Identificador inválido', 'Identificador malformado');
const notFound = error('Incidencia no encontrada', 'Incidencia inexistente');
const serverError = error('Error interno del servidor', 'Error inesperado');
const request = name => ({ required: true, content: json(ref(name)) });
const itemResponse = description => ({ description, content: json(ref('Incident')) });
const properties = {
  title: { type: 'string', minLength: 1, maxLength: 120, example: example.title, description: 'Se eliminan espacios al inicio y al final.' },
  description: { type: 'string', minLength: 1, maxLength: 2000, example: example.description, description: 'Se eliminan espacios al inicio y al final.' },
  category: { type: 'string', enum: ['network', 'application', 'infrastructure', 'security', 'other'], default: 'other' },
  priority: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: 'string', enum: ['open', 'in_progress', 'resolved'], default: 'open' }
};
const bodyErrors = { 400: error('JSON inválido', 'JSON malformado'), 413: error('Cuerpo demasiado grande', 'Cuerpo superior a 100 KB'), 422: invalid, 500: serverError };
export const openapi = {
  openapi: '3.0.3', info: { title: 'ESUMER Incident Manager', version: '1.0.0', description: 'API para gestionar incidencias de TI.' },
  paths: {
    '/api/incidents': {
      get: { summary: 'Listar incidencias', description: 'Filtra por categoría, prioridad y estado; ordena por fecha de creación descendente.', parameters: [ ...['status', 'priority', 'category'].map(name => ({ name, in: 'query', schema: { type: 'string', enum: properties[name].enum } })), ...[{ name: 'page', max: 1000000, def: 1 }, { name: 'limit', max: 100, def: 10 }].map(p => ({ name: p.name, in: 'query', schema: { type: 'integer', minimum: 1, maximum: p.max, default: p.def } })) ], responses: { 200: { description: 'Página de incidencias', content: json(ref('IncidentList')) }, 422: invalid, 500: serverError } },
      post: { summary: 'Crear incidencia', requestBody: request('IncidentCreate'), responses: { 201: itemResponse('Incidencia creada'), ...bodyErrors } }
    },
    '/api/incidents/{id}': {
      get: { summary: 'Consultar incidencia', parameters: [id], responses: { 200: itemResponse('Incidencia encontrada'), 400: badId, 404: notFound, 500: serverError } },
      patch: { summary: 'Actualizar parcialmente una incidencia', description: 'Envíe al menos un campo editable.', parameters: [id], requestBody: request('IncidentUpdate'), responses: { 200: itemResponse('Incidencia actualizada'), ...bodyErrors, 400: { description: 'Identificador o JSON inválido', content: { 'application/json': { schema: ref('Error'), examples: { id: { value: { error: { message: 'Identificador inválido' } } }, json: { value: { error: { message: 'JSON inválido' } } } } } } }, 404: notFound } },
      delete: { summary: 'Eliminar incidencia', parameters: [id], responses: { 204: { description: 'Incidencia eliminada, sin cuerpo' }, 400: badId, 404: notFound, 500: serverError } }
    },
    '/health/live': { get: { summary: 'Comprobar el proceso HTTP', responses: { 200: { description: 'Proceso disponible', content: { 'application/json': { schema: ref('Health'), example: { status: 'ok' } } } } } } },
    '/health/ready': { get: { summary: 'Comprobar la disponibilidad de MongoDB', responses: { 200: { description: 'MongoDB disponible', content: { 'application/json': { schema: ref('Health'), example: { status: 'ok' } } } }, 503: { description: 'MongoDB no disponible', content: { 'application/json': { schema: ref('Health'), example: { status: 'unavailable' } } } } } } }
  },
  components: { schemas: {
    IncidentCreate: { type: 'object', additionalProperties: false, required: ['title', 'description'], properties },
    IncidentUpdate: { type: 'object', additionalProperties: false, minProperties: 1, properties },
    Incident: { type: 'object', required: ['id', 'title', 'description', 'category', 'priority', 'status', 'createdAt', 'updatedAt'], properties: { id: { type: 'string', example: example.id }, ...properties, createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' } }, example },
    IncidentList: { type: 'object', required: ['items', 'pagination'], properties: { items: { type: 'array', items: ref('Incident') }, pagination: { type: 'object', required: ['page', 'limit', 'total', 'totalPages'], properties: { page: { type: 'integer', example: 1 }, limit: { type: 'integer', example: 10 }, total: { type: 'integer', example: 1 }, totalPages: { type: 'integer', example: 1 } } } } },
    Error: { type: 'object', required: ['error'], properties: { error: { type: 'object', required: ['message'], properties: { message: { type: 'string' }, details: { type: 'array', items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } } } } } }, example: { error: { message: 'Datos inválidos', details: [{ field: 'title', message: 'String must contain at least 1 character(s)' }] } } },
    Health: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['ok', 'unavailable'] } } }
  } }
};

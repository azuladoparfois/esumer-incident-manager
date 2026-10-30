import { ZodError } from 'zod';
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) return res.status(422).json({ error: { message: 'Datos inválidos', details: err.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message })) } });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: { message: 'JSON inválido' } });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: { message: 'Cuerpo demasiado grande' } });
  console.error('Error inesperado:', err);
  return res.status(500).json({ error: { message: 'Error interno del servidor' } });
}

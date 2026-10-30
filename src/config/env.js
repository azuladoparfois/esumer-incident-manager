import 'dotenv/config';

export function loadConfig(env = process.env) {
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT debe ser un entero entre 1 y 65535');
  if (!env.MONGODB_URI) throw new Error('MONGODB_URI es obligatorio');
  const origins = (env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map(s => s.trim()).filter(Boolean);
  if (origins.some(origin => {
    try { const url = new URL(origin); return !['http:', 'https:'].includes(url.protocol) || url.origin !== origin; } catch { return true; }
  })) throw new Error('CORS_ORIGIN debe contener orígenes HTTP(S) válidos separados por comas');
  return { port, mongoUri: env.MONGODB_URI, origins };
}

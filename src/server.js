import mongoose from 'mongoose';
import { loadConfig } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { createApp } from './app.js';

let server;
try {
  const config = loadConfig();
  await connectDatabase(config.mongoUri);
  server = createApp({ origins: config.origins }).listen(config.port, () => console.log(`Servidor escuchando en el puerto ${config.port}`));
  server.on('error', async error => { console.error('Error del servidor:', error.message); await mongoose.disconnect(); process.exitCode = 1; });
  mongoose.connection.on('error', error => console.error('Error de MongoDB:', error.message));
} catch (error) {
  console.error('No se pudo iniciar la aplicación:', error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
}
let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Recibida ${signal}; cerrando servidor y base de datos`);
  const timeout = setTimeout(() => { console.error('Tiempo de cierre agotado'); process.exit(1); }, 10000).unref();
  try {
    if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    await mongoose.disconnect();
    clearTimeout(timeout);
  } catch (error) { console.error('Error al cerrar:', error.message); process.exitCode = 1; }
}
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

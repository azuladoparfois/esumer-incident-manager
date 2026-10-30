import mongoose from 'mongoose';
import { loadConfig } from '../src/config/env.js';
import { connectDatabase } from '../src/config/database.js';
import { Incident } from '../src/models/incident.js';

const samples = [
  { title: 'Red intermitente en oficina norte', description: 'Las estaciones pierden conexión durante algunos minutos.', category: 'network', priority: 'high', status: 'open' },
  { title: 'Error al iniciar sesión', description: 'La aplicación interna muestra un error al ingresar.', category: 'application', priority: 'medium', status: 'in_progress' },
  { title: 'Almacenamiento casi lleno', description: 'El servidor de archivos supera el 90% de capacidad.', category: 'infrastructure', priority: 'high', status: 'open' },
  { title: 'Correo sospechoso reportado', description: 'Se recibió un mensaje de phishing ficticio para revisión.', category: 'security', priority: 'medium', status: 'resolved' },
  { title: 'Impresora sin respuesta', description: 'La impresora de pruebas no responde a solicitudes.', category: 'other', priority: 'low', status: 'resolved' }
];
try { await connectDatabase(loadConfig().mongoUri); await Incident.insertMany(samples); console.log('Se crearon cinco incidencias ficticias.'); }
catch (error) { console.error('No se pudieron cargar los datos:', error.message); process.exitCode = 1; }
finally { await mongoose.disconnect(); }

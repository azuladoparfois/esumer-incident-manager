import mongoose from 'mongoose';
import { createSchema, updateSchema, listSchema } from '../validators/incident.js';

export function incidentController(service) {
  const validId = (req, res, next) => /^[a-f\d]{24}$/i.test(req.params.id) && mongoose.isValidObjectId(req.params.id) ? next() : res.status(400).json({ error: { message: 'Identificador inválido' } });
  const missing = res => res.status(404).json({ error: { message: 'Incidencia no encontrada' } });
  return {
    validId,
    list: async (req, res) => res.json(await service.list(listSchema.parse(req.query))),
    get: async (req, res) => { const item = await service.get(req.params.id); return item ? res.json(item) : missing(res); },
    create: async (req, res) => res.status(201).json(await service.create(createSchema.parse(req.body))),
    update: async (req, res) => { const item = await service.update(req.params.id, updateSchema.parse(req.body)); return item ? res.json(item) : missing(res); },
    remove: async (req, res) => { const item = await service.remove(req.params.id); return item ? res.status(204).end() : missing(res); }
  };
}

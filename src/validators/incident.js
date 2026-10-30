import { z } from 'zod';
import { categories, priorities, statuses } from '../models/incident.js';

const fields = {
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(2000),
  category: z.enum(categories), priority: z.enum(priorities), status: z.enum(statuses)
};
export const createSchema = z.object({ ...fields, category: fields.category.optional(), priority: fields.priority.optional(), status: fields.status.optional() }).strict();
export const updateSchema = z.object(fields).partial().strict().refine(value => Object.keys(value).length > 0, 'Se requiere al menos un campo');
const positiveInt = (max) => z.string().regex(/^[1-9]\d*$/).transform(Number).refine(n => Number.isSafeInteger(n) && n <= max, 'Número fuera de rango');
export const listSchema = z.object({ status: fields.status.optional(), priority: fields.priority.optional(), category: fields.category.optional(), page: positiveInt(1000000).optional(), limit: positiveInt(100).optional() }).strict();

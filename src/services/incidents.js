import { Incident } from '../models/incident.js';

export const incidentService = {
  async list({ page = 1, limit = 10, ...filter }) {
    const [items, total] = await Promise.all([
      Incident.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
      Incident.countDocuments(filter)
    ]);
    return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },
  get(id) { return Incident.findById(id); },
  create(data) { return Incident.create(data); },
  update(id, data) { return Incident.findByIdAndUpdate(id, data, { new: true, runValidators: true }); },
  remove(id) { return Incident.findByIdAndDelete(id); }
};

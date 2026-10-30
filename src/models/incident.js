import mongoose from 'mongoose';

export const categories = ['network', 'application', 'infrastructure', 'security', 'other'];
export const priorities = ['low', 'medium', 'high'];
export const statuses = ['open', 'in_progress', 'resolved'];
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  category: { type: String, enum: categories, default: 'other' },
  priority: { type: String, enum: priorities, default: 'medium' },
  status: { type: String, enum: statuses, default: 'open' }
}, { timestamps: true, versionKey: false, toJSON: { transform(_doc, result) { result.id = result._id.toString(); delete result._id; return result; } } });
export const Incident = mongoose.model('Incident', schema);

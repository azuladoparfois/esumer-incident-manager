import mongoose from 'mongoose';

export async function connectDatabase(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
}
export async function isDatabaseReady() {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) return false;
  try { await mongoose.connection.db.admin().ping(); return true; } catch { return false; }
}

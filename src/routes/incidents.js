import { Router } from 'express';
import { incidentController } from '../controllers/incidents.js';
export function incidentRouter(service) {
  const router = Router();
  const c = incidentController(service);
  router.route('/').get(c.list).post(c.create);
  router.route('/:id').all(c.validId).get(c.get).patch(c.update).delete(c.remove);
  return router;
}

import { Application } from 'express';
import appRouter from './app.route';
 import adminRouter from './admin.route';

const router = (app: Application) => {
  app.use('/api', appRouter);
  app.use('/api/admin', adminRouter);
};
export default router;

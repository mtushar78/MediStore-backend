import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import { authRouter } from './modules/auth/auth.routes';
import { cartRouter } from './modules/cart/cart.routes';
import { categoriesRouter } from './modules/categories/categories.routes';
import { medicinesRouter } from './modules/medicines/medicines.routes';
import { ordersRouter } from './modules/orders/orders.routes';
import { reviewsRouter } from './modules/reviews/reviews.routes';
import { usersRouter } from './modules/users/users.routes';

export const createApp = (): Application => {
  const app = express();

  // Core middlewares
  app.use(cors());
  app.use(express.json());

  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'MediStore API is running' });
  });

  // Health check
  app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.status(200).json({ success: true, data: { status: 'ok' } });
  });

  // Routes
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/cart', cartRouter);
  app.use('/api/v1/categories', categoriesRouter);
  app.use('/api/v1/medicines', medicinesRouter);
  app.use('/api/v1/orders', ordersRouter);
  app.use('/api/v1/reviews', reviewsRouter);
  app.use('/api/v1/users', usersRouter);

  // 404 fallback
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  return app;
};

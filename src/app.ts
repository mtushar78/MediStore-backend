import cors from 'cors';
import express, { Application, Request, Response } from 'express';

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

  // 404 fallback
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  return app;
};

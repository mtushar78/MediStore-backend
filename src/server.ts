import dotenv from 'dotenv';
import http from 'http';
import { createApp } from './app';

dotenv.config();

export const startServer = async (): Promise<http.Server> => {
  const app = createApp();

  const port = Number(process.env.PORT) || 5000;
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`[medistore] server listening on port ${port}`);
      resolve();
    });
  });

  return server;
};

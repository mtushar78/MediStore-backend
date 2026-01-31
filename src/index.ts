import { startServer } from './server';

startServer().catch((err) => {
  console.error('[medistore] failed to start server', err);
  process.exit(1);
});

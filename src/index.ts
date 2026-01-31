import { startServer } from './server';

startServer().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[medistore] failed to start server', err);
  process.exit(1);
});

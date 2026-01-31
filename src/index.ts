import { startServer } from './server';

// Keep index.ts very small: start the server and crash on bootstrap errors
startServer().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[medistore] failed to start server', err);
  process.exit(1);
});

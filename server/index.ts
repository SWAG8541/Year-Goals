import { createServer } from 'node:http';
import { createApp } from './app';
import { connectDB } from './config/database';
import { env } from './config/env';
import { log } from './utils/logger';

async function startServer() {
  await connectDB();
  const server = createServer(createApp());
  server.listen(env.port, '0.0.0.0', () => log(`serving on port ${env.port}`));
  server.on('error', (error) => {
    console.error('Server failed:', error);
    process.exitCode = 1;
  });
}

startServer().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});

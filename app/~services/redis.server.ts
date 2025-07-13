import { createClient } from 'redis';
import config from './config.server';

const redis = await createClient({
  url: config.REDIS_URL,
}).connect();
await redis.flushAll();

async function shutdown() {
  try {
    await redis.flushAll();
    await redis.quit();
  } catch {
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default redis;

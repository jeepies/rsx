import { createClient } from 'redis';
import config from './config.server';

const redis = createClient({ url: config.REDIS_URL });

async function initRedis() {
  await redis.connect();
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
}

initRedis().catch((err) => {
  console.error('Failed to initialize Redis:', err);
  process.exit(1);
});

export default redis;

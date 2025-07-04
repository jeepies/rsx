import { createClient } from 'redis';
import config from './config.server';

const redis = await createClient({
  url: config.REDIS_URL,
}).connect();

export default redis;

import 'dotenv/config';

interface Config {
  ENVIRONMENT: string;
  REDIS_URL: string;
  /**
   * Everything should be in ms
   */
  TIMINGS: {
    FETCH_LOCK: number;
    AUTO_REFRESH: number;
    MANUAL_REFRESH: number;
    MIN_SKELETON_TIME: number;
    HOURS_PER_DAY: number;
  };
}

const config: Config = {
  ENVIRONMENT: process.env.NODE_ENV ?? 'development',
  REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',
  TIMINGS: {
    FETCH_LOCK: Number(process.env.FETCH_LOCK) || 30000,
    AUTO_REFRESH: Number(process.env.AUTO_REFRESH) || 900000,
    MANUAL_REFRESH: Number(process.env.MANUAL_REFRESH) || 300000,
    MIN_SKELETON_TIME: Number(process.env.MIN_SKELETON_TIME) || 400,
    HOURS_PER_DAY: 24 * 60 * 60 * 1000,
  },
};

export default config;

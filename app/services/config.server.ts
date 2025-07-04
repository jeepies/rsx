import 'dotenv/config';

interface Config {
  ENVIRONMENT: string;
  REDIS_URL: string;
  TIMINGS: {
    FETCH_LOCK: number;
    AUTO_REFRESH: number;
    MANUAL_REFRESH: number;
  };
}

const config: Config = {
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  TIMINGS: {
    FETCH_LOCK: Number(process.env.FETCH_LOCK) || 30,
    AUTO_REFRESH: Number(process.env.AUTO_REFRESH) || 900,
    MANUAL_REFRESH: Number(process.env.MANUAL_REFRESH) || 5,
  },
};

export default config;

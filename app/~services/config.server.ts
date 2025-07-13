import 'dotenv/config';

interface Config {
  ENVIRONMENT: string;
  REDIS_URL: string;
  /**
   * Everything should be in ms
   */
  TIMINGS: {
    /**
     * Redis fetch lock - 0.5 minutes by default
     */
    FETCH_LOCK: number;
    /**
     * Redis cached data TTL before server can refresh - 15 minutes by default
     */
    AUTO_REFRESH: number;
    /**
     * Redis cached data TTL before user can refresh - 5 minutes by default
     */
    MANUAL_REFRESH: number;
    /**
     * Minimum time to display loading skeleton for, to prevent flickering - 400ms by default
     */
    MIN_SKELETON_TIME: number;
    /**
     * Hours per day. Should always be 24.
     */
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

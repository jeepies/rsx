import type { TaskList } from 'graphile-worker';
import cleanupPlayerViews from './cleanup-player-views';

export const tasks: TaskList = {
  'cleanup-player-views': cleanupPlayerViews,
};

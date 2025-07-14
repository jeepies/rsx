import { run, makeWorkerUtils } from 'graphile-worker';
import 'dotenv/config';
import { tasks } from './tasks';

async function main() {
  const workerPromise = run({
    connectionString: process.env.DATABASE_URL,
    concurrency: 5,
    schema: 'graphile_worker',
    noHandleSignals: true,
    taskList: tasks,
  });

  const workerUtils = await makeWorkerUtils({
    connectionString: process.env.DATABASE_URL,
  });

  const enqueueCleanupJob = async () => {
    try {
      await workerUtils.addJob('cleanup-player-views', {});
      console.log('Enqueued cleanup-player-views job');
    } catch (err) {
      console.error('Failed to enqueue cleanup-player-views job:', err);
    }
  };

  await enqueueCleanupJob();
  setInterval(enqueueCleanupJob, 3600 * 1000);

  await workerPromise;
}

main().catch((err) => {
  console.error('Worker failed:', err);
  process.exit(1);
});

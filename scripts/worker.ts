import { run } from 'graphile-worker';
import 'dotenv/config';

async function main() {
  await run({
    connectionString: process.env.DATABASE_URL,
    concurrency: 5,
    schema: 'graphile_worker',
    noHandleSignals: true, // recommended for dev
  });
}

main();

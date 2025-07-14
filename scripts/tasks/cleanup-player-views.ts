import { Task } from 'graphile-worker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cleanupPlayerViews: Task = async () => {
  const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

  await prisma.playerView.deleteMany({
    where: {
      viewedAt: {
        lt: cutoffDate,
      },
    },
  });
};

export default cleanupPlayerViews;

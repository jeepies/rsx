import { prisma } from '~/~services/prisma.server';

export interface GetSnapshotsOptions {
  rsn: string;
  from: Date;
  to: Date;
  order?: 'asc' | 'desc';
  take?: number;
}

export async function getWithinTimePeriod({
  rsn,
  from,
  to,
  order = 'asc',
  take,
}: GetSnapshotsOptions) {
  const player = await prisma.player.findUnique({
    where: { username: rsn },
  });

  if (!player) throw new Error('Cannot access snapshots of unknown player');

  return prisma.playerSnapshot.findMany({
    where: {
      playerId: player.id,
      timestamp: {
        gte: from,
        lte: to,
      },
    },
    orderBy: {
      timestamp: order,
    },
    include: {
      skills: true,
    },
    ...(take ? { take } : {}),
  });
}

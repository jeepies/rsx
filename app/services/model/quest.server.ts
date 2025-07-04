import { prisma } from '../prisma.server';

export async function getQuestsByStatus(
  rsn: string,
  status: 'NOT_STARTED' | 'STARTED' | 'COMPLETED',
) {
  const latestSnapshot = await prisma.playerSnapshot.findFirst({
    where: {
      player: { username: rsn },
    },
    orderBy: { timestamp: 'desc' },
    include: {
      quests: true,
    },
  });

  if (!latestSnapshot) return [];

  return latestSnapshot.quests.filter((q) => q.status === status);
}

export async function getQuestsByMinQuestPoints(rsn: string, minPoints: number) {
  const latestSnapshot = await prisma.playerSnapshot.findFirst({
    where: {
      player: { username: rsn },
    },
    orderBy: { timestamp: 'desc' },
    include: {
      quests: true,
    },
  });

  if (!latestSnapshot) return [];

  return latestSnapshot.quests.filter((q) => q.questPoints >= minPoints);
}

export async function getEligibleQuests(rsn: string) {
  const latestSnapshot = await prisma.playerSnapshot.findFirst({
    where: {
      player: { username: rsn },
    },
    orderBy: { timestamp: 'desc' },
    include: {
      quests: true,
    },
  });

  if (!latestSnapshot) return [];

  return latestSnapshot.quests.filter((q) => q.userEligible);
}

export async function getAllQuestsForUser(rsn: string) {
  const player = await prisma.player.findUnique({
    where: { username: rsn },
    include: {
      snapshots: {
        orderBy: { timestamp: 'desc' },
        take: 1,
        include: {
          quests: true,
        },
      },
    },
  });

  if (!player || !player.snapshots.length) {
    return [];
  }

  return player.snapshots[0].quests.map((q) => ({
    title: q.title,
    status: q.status,
    difficulty: q.difficulty,
    members: q.members,
    questPoints: q.questPoints,
    userEligible: q.userEligible,
  }));
}

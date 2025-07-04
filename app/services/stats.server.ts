import { prisma } from '~/services/prisma.server';

export async function getTrackedPlayerStats() {
  const totalTrackedPlayers = await prisma.player.count();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const playersBeforeYesterday = await prisma.player.count({
    where: {
      createdAt: {
        lt: startOfYesterday,
      },
    },
  });

  const playersSinceYesterday = totalTrackedPlayers - playersBeforeYesterday;

  // note to self: stop writing long ass fucking ternary statements at 4am
  let percentageIncrease = 0;
  if (playersBeforeYesterday > 0)
    percentageIncrease = (playersSinceYesterday / playersBeforeYesterday) * 100;
  else percentageIncrease = 100;

  return {
    totalTrackedPlayers,
    percentageIncrease,
  };
}

import { prisma } from '../prisma.server';
import { SkillData } from '../runescape.server';

export async function getXPSinceYesterday(RSN: string) {
  const now = new Date();
  // lmfao
  const yesterdayNow = new Date(new Date().setDate(now.getDate() - 1));

  const mostRecent = await prisma.player.findUnique({
    where: {
      rsn: RSN,
    },
  });

  if (!mostRecent) return 0; // probably an untracked player lol

  const allSinceYesterday = await prisma.playerSnapshot.findMany({
    where: {
      playerId: mostRecent.id,
      timestamp: {
        lte: now,
        gte: yesterdayNow,
      },
    },
  });

  const data = [mostRecent, ...allSinceYesterday];

  const filteredData = data
    .map((slice) => JSON.parse(JSON.stringify(slice.data)))
    .filter((slice) => slice['formattedSkills'] !== undefined)
    .map((slice) => slice.formattedSkills)
    .reverse();

  let increase: Record<string, SkillData> = {};

  if (filteredData.length >= 2) {
    const first = filteredData[0];
    const last = filteredData[filteredData.length - 1];

    Object.keys(last).forEach((skillName) => {
      const start = first[skillName];
      const end = last[skillName];

      if (start && end) {
        increase[skillName] = {
          xp: end.xp - start.xp,
          level: end.level - start.level,
          rank: start.rank - end.rank,
        };
      }
    });
  }

  return increase;
}

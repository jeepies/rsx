import config from '~/~services/config.server';
import { prisma } from '~/~services/prisma.server';
import { SkillCategories } from '~/~constants/Skills';
import { getWithinTimePeriod } from './snapshot.server';
import { dropInitialSpike } from '~/lib/server/utils.server';
import { Prisma } from '@prisma/client';

export async function getWeeklyXpByDay(username: string) {
  const now = new Date();
  const startDate = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

  const rawSnapshots = await prisma.playerSnapshot.findMany({
    where: {
      player: { username },
      timestamp: { gte: startDate },
    },
    orderBy: { timestamp: 'asc' },
    select: { totalXp: true, timestamp: true },
  });

  const snapshots = dropInitialSpike(rawSnapshots);

  const snapshotsByDate = new Map<string, { totalXp: bigint; timestamp: Date }>();

  for (const snap of snapshots) {
    const dateKey = snap.timestamp.toISOString().slice(0, 10);
    const existing = snapshotsByDate.get(dateKey);
    if (!existing || snap.timestamp > existing.timestamp) {
      snapshotsByDate.set(dateKey, snap);
    }
  }

  const xpData = [];
  let prevXp: bigint | null = null;

  for (let i = 7; i >= 1; i--) {
    const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = day.toISOString().slice(0, 10);
    const current = snapshotsByDate.get(key)?.totalXp;

    if (prevXp === null || current === undefined) {
      xpData.push({ date: `Day ${8 - i}`, dailyXP: 0 });
    } else {
      const diff = current - prevXp;
      xpData.push({ date: `Day ${8 - i}`, dailyXP: Number(diff > 0n ? diff : 0n) });
    }

    if (current !== undefined) prevXp = current;
  }

  return xpData;
}

export async function getDailyXpIncreases(rsn: string) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - config.TIMINGS.HOURS_PER_DAY);

  const snapshots = await getWithinTimePeriod({
    rsn,
    from: oneDayAgo,
    to: now,
    order: 'asc',
  });

  if (snapshots.length < 2) return {};

  const firstSkills = Object.fromEntries(snapshots[0].skills.map((s) => [s.name, s.xp]));
  const lastSkills = Object.fromEntries(
    snapshots[snapshots.length - 1].skills.map((s) => [s.name, s.xp]),
  );

  const xpIncreases: Record<string, number> = {};
  for (const skillName in lastSkills) {
    xpIncreases[skillName] = Number(lastSkills[skillName] - (firstSkills[skillName] ?? 0n));
  }

  return xpIncreases;
}

export async function getDailyLevelIncreases(rsn: string) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - config.TIMINGS.HOURS_PER_DAY);

  const snapshots = await getWithinTimePeriod({
    rsn,
    from: oneDayAgo,
    to: now,
    order: 'asc',
  });

  if (snapshots.length < 2) return {};

  const firstSkills = Object.fromEntries(snapshots[0].skills.map((s) => [s.name, s.level]));
  const lastSkills = Object.fromEntries(
    snapshots[snapshots.length - 1].skills.map((s) => [s.name, s.level]),
  );

  const levelIncreases: Record<string, number> = {};
  for (const skillName in lastSkills) {
    levelIncreases[skillName] = Number(lastSkills[skillName] - (firstSkills[skillName] ?? 0n));
  }

  return levelIncreases;
}

export async function getTotalXpGainedByDay() {
  const now = new Date();
  const startDate = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

  const snapshots = await prisma.playerSnapshot.findMany({
    where: { timestamp: { gte: startDate } },
    orderBy: { timestamp: 'asc' },
    select: {
      playerId: true,
      totalXp: true,
      timestamp: true,
    },
  });

  const groupedByDateAndPlayer = new Map<
    string,
    Map<string, { totalXp: bigint; timestamp: Date }>
  >();

  for (const snap of snapshots) {
    const dateKey = snap.timestamp.toISOString().slice(0, 10);
    if (!groupedByDateAndPlayer.has(dateKey)) {
      groupedByDateAndPlayer.set(dateKey, new Map());
    }

    const playerMap = groupedByDateAndPlayer.get(dateKey)!;
    const current = playerMap.get(snap.playerId);
    if (!current || snap.timestamp > current.timestamp) {
      playerMap.set(snap.playerId, {
        totalXp: BigInt(snap.totalXp),
        timestamp: snap.timestamp,
      });
    }
  }

  const allDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (7 - i) * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });

  const day0 = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
  const day0Key = day0.toISOString().slice(0, 10);
  const day0Map = groupedByDateAndPlayer.get(day0Key) ?? new Map();

  let prevXpByPlayer = new Map<string, bigint>();
  let seenPlayers = new Set<string>();

  for (const [playerId, snap] of day0Map) {
    prevXpByPlayer.set(playerId, snap.totalXp);
    seenPlayers.add(playerId);
  }

  const results: { date: string; dailyXP: number }[] = [];

  for (const dateKey of allDates) {
    const currentMap = groupedByDateAndPlayer.get(dateKey) ?? new Map();
    let totalXp = 0n;

    for (const [playerId, snap] of currentMap) {
      const prev = prevXpByPlayer.get(playerId) ?? 0n;

      if (!seenPlayers.has(playerId)) {
        seenPlayers.add(playerId);
        prevXpByPlayer.set(playerId, snap.totalXp);
        continue;
      }

      const gain = snap.totalXp - prev;
      if (gain > 0n) totalXp += gain;
      prevXpByPlayer.set(playerId, snap.totalXp);
    }

    results.push({
      date: dateKey,
      dailyXP: Number(totalXp),
    });
  }

  return results;
}

export async function getXpBySkillCategoryLast24h() {
  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const snapshots = await prisma.playerSnapshot.findMany({
    where: { timestamp: { gte: since } },
    include: { skills: true },
    orderBy: { timestamp: 'asc' },
  });

  // group by playerId
  const byPlayer = new Map<string, { first: Map<string, bigint>; last: Map<string, bigint> }>();

  for (const snap of snapshots) {
    const skillMap = new Map<string, bigint>(snap.skills.map((s) => [s.name, BigInt(s.xp)]));

    if (!byPlayer.has(snap.playerId)) {
      byPlayer.set(snap.playerId, { first: skillMap, last: skillMap });
    } else {
      byPlayer.get(snap.playerId)!.last = skillMap;
    }
  }

  const categoryTotals: Record<keyof typeof SkillCategories, bigint> = {
    Combat: 0n,
    Gathering: 0n,
    Artisan: 0n,
    Support: 0n,
  };

  for (const { first, last } of byPlayer.values()) {
    for (const [category, skills] of Object.entries(SkillCategories)) {
      let xpGain = 0n;
      for (const skill of skills) {
        const before = first.get(skill) ?? 0n;
        const after = last.get(skill) ?? 0n;
        if (after > before) {
          xpGain += after - before;
        }
      }
      categoryTotals[category as keyof typeof SkillCategories] += xpGain;
    }
  }

  const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0n);

  const output = Object.entries(categoryTotals).map(([name, val]) => ({
    name,
    value: total === 0n ? 0 : Math.round(Number((val * 10000n) / total)) / 100,
  }));

  return output;
}

export async function getTopGainersLast24h(limit = 10) {
  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const snapshots = await prisma.playerSnapshot.findMany({
    where: { timestamp: { gte: since } },
    orderBy: { timestamp: 'asc' },
    select: {
      playerId: true,
      totalXp: true,
      player: { select: { username: true } },
    },
  });

  const byPlayer = new Map<string, { username: string; firstXp: bigint; lastXp: bigint }>();

  for (const snap of snapshots) {
    if (!snap.player?.username) continue;

    const totalXpBigInt = BigInt(snap.totalXp);

    if (!byPlayer.has(snap.playerId)) {
      byPlayer.set(snap.playerId, {
        username: snap.player.username,
        firstXp: totalXpBigInt,
        lastXp: totalXpBigInt,
      });
    } else {
      const entry = byPlayer.get(snap.playerId)!;
      entry.lastXp = totalXpBigInt;
    }
  }

  function formatXp(xp: bigint): string {
    if (xp >= 1_000_000_000n) return (Number(xp) / 1_000_000_000).toFixed(1) + 'B';
    if (xp >= 1_000_000n) return (Number(xp) / 1_000_000).toFixed(1) + 'M';
    if (xp >= 1_000n) return (Number(xp) / 1_000).toFixed(1) + 'K';
    return xp.toString();
  }

  const results = Array.from(byPlayer.values())
    .map(({ username, firstXp, lastXp }) => {
      const gained = lastXp - firstXp;
      return {
        username,
        xp: formatXp(lastXp),
        gained: formatXp(gained),
        gainedNum: gained,
      };
    })
    .filter(({ gainedNum }) => gainedNum > 0)
    .sort((a, b) => Number(b.gainedNum - a.gainedNum))
    .slice(0, limit)
    .map(({ username, xp, gained }, i) => ({
      rank: i + 1,
      player: username,
      xp,
      gained,
    }));

  return results;
}

export async function getTotalTrackedPlayers() {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

  const [todayCount, yesterdayCount] = await Promise.all([
    prisma.player.count({
      where: {
        createdAt: {
          gte: todayStart,
        },
      },
    }),
    prisma.player.count({
      where: {
        createdAt: {
          gte: yesterdayStart,
          lt: todayStart,
        },
      },
    }),
  ]);

  const value = await prisma.player.count();
  const percentage =
    yesterdayCount === 0 ? 100 : ((todayCount - yesterdayCount) / yesterdayCount) * 100;

  return { value, percentage };
}

export async function getTotalXpGainedLast24h() {
  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const beforeSince = new Date(since.getTime() - 24 * 60 * 60 * 1000);

  async function getXpGainedBetween(start: Date, end: Date) {
    const snapshots = await prisma.playerSnapshot.findMany({
      where: {
        timestamp: {
          gte: start,
          lt: end,
        },
      },
      orderBy: { timestamp: 'asc' },
      select: {
        playerId: true,
        totalXp: true,
        timestamp: true,
      },
    });

    const snapshotsByPlayer = new Map<string, { totalXp: bigint; timestamp: Date }[]>();

    for (const snap of snapshots) {
      if (!snapshotsByPlayer.has(snap.playerId)) {
        snapshotsByPlayer.set(snap.playerId, []);
      }
      snapshotsByPlayer.get(snap.playerId)!.push({
        totalXp: BigInt(snap.totalXp),
        timestamp: snap.timestamp,
      });
    }

    let totalGain = 0n;

    for (const snaps of snapshotsByPlayer.values()) {
      if (snaps.length < 2) continue;

      const filteredSnaps = snaps.slice(1);

      if (filteredSnaps.length < 1) continue;

      const xpGain = filteredSnaps[filteredSnaps.length - 1].totalXp - filteredSnaps[0].totalXp;

      if (xpGain > 0n) totalGain += xpGain;
    }

    return totalGain;
  }

  const [currentGain, previousGain] = await Promise.all([
    getXpGainedBetween(since, now),
    getXpGainedBetween(beforeSince, since),
  ]);

  const value = currentGain.toString();
  const percentage =
    previousGain === 0n
      ? 100
      : Number(((currentGain - previousGain) * 10000n) / previousGain) / 100;

  return { value, percentage };
}

export async function getTrackedDaysByUsername(username: string) {
  const player = await prisma.player.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!player) return 0;

  const oldest = await prisma.playerSnapshot.findFirst({
    where: { playerId: player.id },
    orderBy: { timestamp: 'asc' },
    select: { timestamp: true },
  });

  const latest = await prisma.playerSnapshot.findFirst({
    where: { playerId: player.id },
    orderBy: { timestamp: 'desc' },
    select: { timestamp: true },
  });

  if (!oldest || !latest) return 0;

  const diffMs = latest.timestamp.getTime() - oldest.timestamp.getTime();
  return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export async function getMaxedPlayers() {
  const players = await prisma.player.count({
    where: {
      snapshots: {
        some: {
          skills: {
            every: {
              level: {
                gte: 99,
              },
            },
          },
        },
      },
    },
  });
  return players;
}

export async function getActivePlayersToday() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const players = await prisma.playerSnapshot.findMany({
    where: {
      timestamp: {
        gte: startOfToday,
      },
    },
    select: { playerId: true },
  });

  const uniqueIds = new Set(players.map((p) => p.playerId));

  return uniqueIds.size;
}

export async function getWeeklyTotalXP() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const snapshots = await prisma.playerSnapshot.findMany({
    where: { timestamp: { gte: since } },
    orderBy: { timestamp: 'asc' },
    select: {
      playerId: true,
      totalXp: true,
    },
  });

  const byPlayer = new Map<string, { first: bigint; last: bigint }>();

  for (const snapshot of snapshots) {
    const xp = BigInt(snapshot.totalXp);
    if (!byPlayer.has(snapshot.playerId)) {
      byPlayer.set(snapshot.playerId, { first: xp, last: xp });
    } else {
      byPlayer.get(snapshot.playerId)!.last = xp;
    }
  }

  let gain = 0n;

  for (const { first, last } of byPlayer.values()) {
    if (last > first) gain += last - first;
  }

  return Number(gain);
}

export async function getTopPopularSkills(limit = 8) {
  const snapshots = await prisma.playerSnapshot.findMany({
    select: {
      playerId: true,
      skills: {
        select: {
          name: true,
          level: true,
        },
      },
    },
  });

  const skillToPlayerIDs = new Map<string, Set<string>>();

  for (const snap of snapshots) {
    for (const skill of snap.skills) {
      if (skill.level >= 99) {
        if (!skillToPlayerIDs.has(skill.name)) {
          skillToPlayerIDs.set(skill.name, new Set());
        }
        skillToPlayerIDs.get(skill.name)!.add(snap.playerId);
      }
    }
  }

  const result = Array.from(skillToPlayerIDs.entries())
    .map(([skill, playerSet]) => ({
      skill,
      players: playerSet.size,
    }))

    .sort((a, b) => b.players - a.players)
    .slice(0, limit);
  return result;
}

export async function getSkillLeaderboard(skillName: string, timePeriod: string) {
  const now = new Date();
  let since: Date | null = null;

  switch (timePeriod) {
    case 'month':
      since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'week':
      since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'today':
      since = new Date();
      since.setHours(0, 0, 0, 0);
    case 'all_time':
    default:
      break;
  }

  const snapshots = await prisma.playerSnapshot.findMany({
    where: since ? { timestamp: { gte: since } } : undefined,
    orderBy: { timestamp: 'asc' },
    include: {
      player: { select: { username: true } },
      skills: true,
    },
  });

  const isOverall = skillName.toLowerCase() === 'overall';

  const byPlayer = new Map<
    string,
    { username: string; first: bigint; last: bigint; level: bigint }
  >();

  for (const snapshot of snapshots) {
    const xp = isOverall
      ? snapshot.skills.reduce((sum, skill) => sum + BigInt(skill.xp), 0n)
      : BigInt(snapshot.skills.find((s) => s.name === skillName)?.xp ?? 0n);

    if (!byPlayer.has(snapshot.playerId)) {
      byPlayer.set(snapshot.playerId, {
        username: snapshot.player.username,
        first: xp,
        last: xp,
        level: snapshot.totalSkill,
      });
    } else {
      byPlayer.get(snapshot.playerId)!.last = xp;
    }
  }

  const leaderboard = Array.from(byPlayer.values())
    .map((entry) => ({
      player: entry.username,
      xp: Number(entry.last),
      gained: Number(entry.last - entry.first),
      level: Number(entry.level),
    }))
    .filter((entry) => entry.gained > 0)
    .sort((a, b) => b.gained - a.gained)
    .map((entry, idx) => ({
      rank: idx + 1,
      player: entry.player,
      xp: entry.xp,
      gained: entry.gained,
      level: entry.level,
    }));

  return leaderboard;
}

export async function getPlayerStatus(
  username: string,
): Promise<'ONLINE' | 'OFFLINE' | 'INACTIVE'> {
  const player = await prisma.player.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!player) return 'INACTIVE';

  const recentSnapshots = await prisma.playerSnapshot.findMany({
    where: { playerId: player.id },
    orderBy: { timestamp: 'desc' },
    take: 10,
    select: { totalXp: true, timestamp: true },
  });

  if (recentSnapshots.length < 2) return 'INACTIVE';

  let latestActivity: Date | null = null;

  for (let i = 0; i < recentSnapshots.length - 1; i++) {
    const current = BigInt(recentSnapshots[i].totalXp);
    const prev = BigInt(recentSnapshots[i + 1].totalXp);
    if (current > prev) {
      latestActivity = recentSnapshots[i].timestamp;
      break;
    }
  }

  if (!latestActivity) return 'INACTIVE';

  const daysSince = Math.floor((Date.now() - latestActivity.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSince < 15) return 'ONLINE';
  if (daysSince < 30) return 'OFFLINE';
  return 'INACTIVE';
}

export async function getAllPlayers(): Promise<
  Prisma.PlayerGetPayload<{ include: { snapshots: true } }>[] | undefined
> {
  if (process.env.NODE_ENV !== 'development') return;
  return await prisma.player.findMany({
    include: {
      snapshots: true,
    },
  });
}

export async function getMostViewedPlayers(limit: number = 8) {
  const views = await prisma.playerView.groupBy({
    by: ['playerId'],
    _count: {
      playerId: true,
    },
    orderBy: {
      _count: {
        playerId: 'desc',
      },
    },
    take: limit,
  });

  const playerIds = views.map((v) => v.playerId);

  const playersWithSnapshot = await prisma.player.findMany({
    where: {
      id: { in: playerIds },
    },
    include: {
      snapshots: {
        orderBy: { timestamp: 'desc' },
        take: 1,
        select: {
          totalSkill: true,
        },
      },
    },
  });

  const result = views.map((view) => {
    const player = playersWithSnapshot.find((p) => p.id === view.playerId);
    return {
      playerId: view.playerId,
      username: player?.username ?? 'Unknown',
      viewCount: view._count.playerId,
      totalLevel: player?.snapshots[0]?.totalSkill ?? null,
    };
  });

  return result;
}

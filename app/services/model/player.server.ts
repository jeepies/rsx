import { bigintReplacer, dayNames, formatXp } from '~/lib/utils';
import config from '../config.server';
import { prisma } from '../prisma.server';
import redis from '../redis.server';
import { TransformedPlayerData, transformPlayerData } from '../transformers/player.server';
import { RunescapeAPI } from '~/services/runescape.server';
import { getWithinTimePeriod } from './snapshot.server';
import { format, getDay, parseISO } from 'date-fns';
import { transformQuestData } from '../transformers/quest.server';

// i sure fucking hope this doesn't change ever....
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface CachedPlayerData extends TransformedPlayerData {
  fetchedAt: number;
}

export function getRedisKey(rsn: string): string {
  return `rsn:lock:${rsn}`;
}

export function getCacheKey(rsn: string): string {
  return `rsn:fresh:${rsn}`;
}

/**
 * Can a user be refreshed?
 * @param rsn Runescape Name
 * @returns Promise<boolean>
 */
export async function canRefresh(rsn: string): Promise<boolean> {
  const isLocked = await redis.get(getRedisKey(rsn));
  return !isLocked;
}

export async function getRefreshTimestamp(rsn: string) {
  const timestamp = await redis.expireTime(getRedisKey(rsn));
  return timestamp;
}

/**
 * Commit a lock to redis
 * @param rsn Runescape Name
 */
export async function commitLock(rsn: string): Promise<void> {
  await redis.set(getRedisKey(rsn), '1', { EX: config.TIMINGS.FETCH_LOCK });
}

/**
 * Get the most up-to-date data
 * @param rsn Runecape Name
 * @returns User
 */
export async function getFreshestData(rsn: string) {
  // okay for the first time in a while i'll write some in-depth comments
  // because this will be a chonky boy

  const cacheKey = getCacheKey(rsn);

  // if cached data is nice and fresh, let's just grab that
  const cachedRaw = await redis.get(cacheKey);
  if (cachedRaw) {
    try {
      const cached: CachedPlayerData = JSON.parse(cachedRaw);
      const now = Date.now();
      if (cached.fetchedAt + config.TIMINGS.AUTO_REFRESH * 1000 > now) {
        const { fetchedAt, ...transformed } = cached;
        return transformed;
      }
    } catch {
      // this data is shit. lets just carry on.
    }
  }

  const playerRow = await prisma.player.upsert({
    where: { username: rsn },
    update: {},
    create: {
      username: rsn,
      lastFetchedAt: new Date(),
    },
  });

  if (await canRefresh(rsn)) {
    await commitLock(rsn);
    try {
      const rawProfile = await RunescapeAPI.fetchRuneMetricsProfile(rsn);
      const questRaw = await RunescapeAPI.fetchRuneMetricsQuests(rsn);

      const rawData = {
        name: rawProfile.name,
        rank: rawProfile.rank,
        totalxp: rawProfile.totalxp,
        totalskill: rawProfile.totalskill,
        combatlevel: rawProfile.combatlevel,
        loggedIn: rawProfile.loggedIn,
        skillvalues: rawProfile.skillvalues,
        activities: rawProfile.activities.map((a) => ({
          date: a.date ?? new Date().toISOString(),
          text: a.text ?? '',
          details: a.details ?? '',
        })),
      };

      const transformedData = transformPlayerData(rawData);
      const transformedQuests = transformQuestData(questRaw);

      // create a snapshot of this moment
      await prisma.playerSnapshot.create({
        data: {
          playerId: playerRow.id,
          timestamp: new Date(),
          rank: transformedData.rank,
          totalXp: transformedData.totalXp,
          totalSkill: transformedData.totalSkill,
          combatLevel: transformedData.combatLevel,
          loggedIn: transformedData.loggedIn,
          skills: {
            create: Object.entries(transformedData.skills).map(([name, skill]) => ({
              name: name as any,
              xp: skill.xp,
              rank: skill.rank,
              level: skill.level,
            })),
          },
          activities: {
            create: transformedData.activities.map((a) => ({
              date: a.date,
              text: a.text,
              details: a.details,
            })),
          },
          quests: {
            create: transformedQuests.map((q) => ({
              title: q.title,
              status: q.status,
              difficulty: q.difficulty,
              members: q.members,
              questPoints: q.questPoints,
              userEligible: q.userEligible,
            })),
          },
        },
      });

      // update the lastFetchedAt date
      await prisma.player.update({
        where: { id: playerRow.id },
        data: { lastFetchedAt: new Date() },
      });

      // cache it please (excluding quests for now — add if needed)
      await redis.set(
        cacheKey,
        JSON.stringify(
          { ...transformedData, quests: transformedQuests, fetchedAt: Date.now() },
          bigintReplacer,
        ),
        {
          EX: config.TIMINGS.AUTO_REFRESH,
        },
      );

      return {
        ...transformedData,
        quests: transformedQuests,
      };
    } catch (error) {
      console.error(`Fetch failed for ${rsn}:`, error);
      // lets just get the stale old db record :(
    }

    const playerWithSnapshots = await prisma.player.findUnique({
      where: { username: rsn },
      include: {
        snapshots: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          include: {
            skills: true,
            activities: true,
            quests: true,
          },
        },
      },
    });

    // i had to cover my eyes writing this
    if (playerWithSnapshots?.snapshots?.length) {
      const latest = playerWithSnapshots.snapshots[0];
      const removeLastDigit = (num: number | bigint) => Math.floor(Number(num) / 10);

      return {
        username: playerWithSnapshots.username,
        rank: latest.rank,
        totalXp: latest.totalXp,
        totalSkill: latest.totalSkill,
        combatLevel: latest.combatLevel,
        loggedIn: latest.loggedIn,
        skills: latest.skills.reduce(
          (acc, skill) => {
            acc[skill.name] = {
              xp: removeLastDigit(skill.xp),
              level: removeLastDigit(skill.level),
              rank: removeLastDigit(skill.rank),
            };
            return acc;
          },
          {} as Record<string, { xp: number; level: number; rank: number }>,
        ),
        activities: latest.activities.map((a) => ({
          date: a.date.toISOString(),
          text: a.text,
          details: a.details,
        })),
        quests: latest.quests.map((q) => ({
          title: q.title,
          status: q.status,
          difficulty: q.difficulty,
          members: q.members,
          questPoints: q.questPoints,
          userEligible: q.userEligible,
        })),
      };
    }

    // achievement got: how did we end up here
    return {
      username: playerRow.username,
      rank: 0,
      totalXp: 0,
      totalSkill: 0,
      combatLevel: 0,
      loggedIn: false,
      skills: {},
      activities: [],
      quests: [],
    };
  }
}

export async function getDailyXpIncreases(rsn: string) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - ONE_DAY_MS);

  const snapshots = await getWithinTimePeriod({
    rsn,
    from: oneDayAgo,
    to: now,
    order: 'asc',
  });

  if (snapshots.length < 2) return {};

  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];

  const firstSkills = Object.fromEntries(first.skills.map((s) => [s.name, s.xp]));
  const lastSkills = Object.fromEntries(last.skills.map((s) => [s.name, s.xp]));

  const xpIncreases: Record<string, number> = {};
  for (const skillName in lastSkills) {
    xpIncreases[skillName] = Number(lastSkills[skillName] - (firstSkills[skillName] ?? 0));
  }
  return xpIncreases;
}

export async function getDailyLevelIncreases(rsn: string) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - ONE_DAY_MS);

  const snapshots = await getWithinTimePeriod({
    rsn,
    from: oneDayAgo,
    to: now,
    order: 'asc',
  });

  if (snapshots.length < 2) return {};

  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];

  const firstSkills = Object.fromEntries(first.skills.map((s) => [s.name, s.level]));
  const lastSkills = Object.fromEntries(last.skills.map((s) => [s.name, s.level]));

  const levelIncreases: Record<string, number> = {};
  for (const skillName in lastSkills) {
    levelIncreases[skillName] = Number(lastSkills[skillName] - (firstSkills[skillName] ?? 0));
  }
  return levelIncreases;
}

export async function getDailyRankIncrease(rsn: string): Promise<number> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - ONE_DAY_MS);

  const snapshots = await getWithinTimePeriod({
    rsn,
    from: oneDayAgo,
    to: now,
    order: 'asc',
  });

  if (snapshots.length < 2) return 0;

  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];

  return last.rank - first.rank;
}

export async function getDailyXPForWeek(rsn: string): Promise<{ date: string; dailyXP: number }[]> {
  const now = new Date();
  const eightDaysAgo = new Date(now.getTime() - ONE_DAY_MS * 8);
  const snapshots = await getWithinTimePeriod({
    rsn,
    from: eightDaysAgo,
    to: now,
    order: 'asc',
  });
  if (snapshots.length < 2) return [];
  const grouped: Record<string, typeof snapshots> = {};
  for (const snap of snapshots) {
    const dayKey = format(snap.timestamp, 'yyyy-MM-dd');
    if (!grouped[dayKey]) grouped[dayKey] = [];
    grouped[dayKey].push(snap);
  }
  const sortedDays = Object.keys(grouped).sort();
  const xpData: { date: string; dailyXP: number }[] = [];
  for (let i = 0; i < sortedDays.length; i++) {
    const day = sortedDays[i];
    const daySnaps = grouped[day];
    if (daySnaps.length < 2) continue;
    const firstSnap = daySnaps[0];
    const lastSnap = daySnaps[daySnaps.length - 1];
    const firstXp = Number(firstSnap.totalXp);
    const lastXp = Number(lastSnap.totalXp);
    const xpDiff = Math.max(lastXp - firstXp, 0);
    xpData.push({
      date: `Day ${xpData.length + 1}`,
      dailyXP: xpDiff,
    });
  }
  return xpData;
}

export async function getTrackedDaysCount(rsn: string): Promise<number> {
  const snapshots = await prisma.playerSnapshot.findMany({
    where: {
      player: {
        username: rsn,
      },
    },
    select: {
      timestamp: true,
    },
    orderBy: {
      timestamp: 'asc',
    },
  });

  const uniqueDays = new Set<string>();
  for (const snap of snapshots) {
    const day = format(snap.timestamp, 'yyyy-MM-dd');
    uniqueDays.add(day);
  }

  return uniqueDays.size;
}

export async function getTotalXpPerDayOfWeek(): Promise<{ name: string; xp: number }[]> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * ONE_DAY_MS);

  const snapshots = await prisma.playerSnapshot.findMany({
    where: {
      timestamp: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      playerId: true,
      timestamp: true,
      totalXp: true,
    },
  });

  const playerDayXp: Record<string, Record<string, bigint>> = {};

  for (const snap of snapshots) {
    const dayKey = format(snap.timestamp, 'yyyy-MM-dd');
    if (!playerDayXp[snap.playerId]) playerDayXp[snap.playerId] = {};
    playerDayXp[snap.playerId][dayKey] = snap.totalXp;
  }

  const allDays = Array.from(
    new Set(snapshots.map((s) => format(s.timestamp, 'yyyy-MM-dd'))),
  ).sort();

  const totalXpPerDay: Record<string, bigint> = {};

  for (let i = 1; i < allDays.length; i++) {
    const today = allDays[i];
    const yesterday = allDays[i - 1];

    let totalGainForDay = 0n;

    for (const playerId in playerDayXp) {
      const todayXp = playerDayXp[playerId][today];
      const yesterdayXp = playerDayXp[playerId][yesterday];

      if (todayXp !== undefined && yesterdayXp !== undefined) {
        const gain = todayXp > yesterdayXp ? todayXp - yesterdayXp : 0n;
        totalGainForDay += gain;
      }
    }

    totalXpPerDay[today] = totalGainForDay;
  }

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * ONE_DAY_MS);
    last7Days.push(format(d, 'yyyy-MM-dd'));
  }

  const result = last7Days.map((dateStr) => {
    const dateObj = parseISO(dateStr);
    const dayName = dayNames[dateObj.getDay()];
    const xpBigint = totalXpPerDay[dateStr] ?? 0n;

    const xp = Number(xpBigint > 9007199254740991n ? 9007199254740991n : xpBigint);

    return {
      name: dayName,
      xp,
    };
  });

  return result;
}

export async function getTopXpGainersToday(limit = 10) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart.getTime() + ONE_DAY_MS);
  async function getLatestSnapshotsBefore(timestamp: Date) {
    const snaps = await prisma.playerSnapshot.findMany({
      where: {
        timestamp: {
          lte: timestamp,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      select: {
        playerId: true,
        timestamp: true,
        totalXp: true,
        player: {
          select: {
            username: true,
          },
        },
      },
    });

    const latestMap = new Map<string, (typeof snaps)[0]>();
    for (const snap of snaps) {
      if (!latestMap.has(snap.playerId)) {
        latestMap.set(snap.playerId, snap);
      }
    }
    return latestMap;
  }

  const yesterdaySnaps = await getLatestSnapshotsBefore(todayStart);
  const todaySnaps = await getLatestSnapshotsBefore(tomorrowStart);

  const playersData: {
    player: string;
    xpTotal: number;
    xpGained: number;
  }[] = [];

  for (const [playerId, todaySnap] of todaySnaps.entries()) {
    const yesterdaySnap = yesterdaySnaps.get(playerId);
    if (!yesterdaySnap) continue;
    const gained = Number(todaySnap.totalXp) - Number(yesterdaySnap.totalXp);
    if (gained <= 0) continue;
    playersData.push({
      player: todaySnap.player.username,
      xpTotal: Number(todaySnap.totalXp),
      xpGained: gained,
    });
  }

  playersData.sort((a, b) => b.xpGained - a.xpGained);

  const result = playersData.slice(0, limit).map((p, i) => ({
    rank: i + 1,
    player: p.player,
    xp: formatXp(p.xpTotal),
    gained: formatXp(p.xpGained),
  }));

  return result;
}

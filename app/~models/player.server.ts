import config from '~/services/config.server';
import { prisma } from '~/services/prisma.server';
import redis from '~/services/redis.server';
import { RuneMetrics } from '~/services/runescape.server';
import { IdMap, SkillCategories } from '~/~constants/Skills';
import { CachedPlayerData, PlayerData } from '~/~types/PlayerData';
import { getWithinTimePeriod } from './snapshot.server';

function getRedisKey(username: string): string {
  return `rsn:lock:${username}`;
}

function getCacheKey(username: string): string {
  return `rsn:fresh:${username}`;
}

export async function canRefresh(username: string): Promise<boolean> {
  // check if there is a lock for this username in redis
  const isLocked = await redis.get(getRedisKey(username));
  return !isLocked;
}

export async function commitLock(username: string): Promise<void> {
  // set a lock key in redis with expiry to prevent concurrent refreshes
  await redis.set(getRedisKey(username), '1', {
    expiration: { type: 'PX', value: config.TIMINGS.FETCH_LOCK },
  });
}

export async function getFreshestData(username: string) {
  const cacheKey = getCacheKey(username);

  // try to get cached data from redis
  const cachedRaw = await redis.get(cacheKey);
  if (cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw) as {
        data: PlayerData | string;
        fetchedAt: number;
      };
      const now = Date.now();
      // if cached data is still fresh, return it
      if (cached.fetchedAt + config.TIMINGS.AUTO_REFRESH > now) {
        return cached.data;
      }
    } catch {
      // corrupted cache data, just ignore and continue
    }
  }

  // ensure player exists in database or create new
  const playerRow = await prisma.player.upsert({
    where: { username },
    update: {},
    create: {
      username,
      lastFetchedAt: new Date(),
    },
  });

  // only proceed if no lock exists for this username
  if (await canRefresh(username)) {
    // commit a lock to prevent other refreshes during this operation
    await commitLock(username);

    try {
      // fetch fresh profile data from RuneMetrics
      const data = await RuneMetrics.getFullProfile(username);

      // if RuneMetrics returns a string (likely an error), release lock and return it
      if (typeof data === 'string') {
        await redis.del(getRedisKey(username));
        return data;
      }

      // create a new snapshot in the database for this fresh data
      await prisma.playerSnapshot.create({
        data: {
          playerId: playerRow.id,
          timestamp: new Date(),
          rank: Number(data.Skills.Rank.replace(/,/g, '')),
          totalXp: data.Skills.XP,
          totalSkill: data.Skills.Level,
          combatLevel: data.Skills.CombatLevel,
          loggedIn: data.LoggedIn,
          quests_completed: data.Quests.Completed,
          quests_in_progress: data.Quests.InProgress,
          quests_not_started: data.Quests.NotStarted,
          skills: {
            create: data.Skills.Skills.map((skill) => ({
              name: skill.HumanName as any,
              xp: skill.XP,
              rank: skill.Rank,
              level: skill.Level,
            })),
          },
          quests: {
            create: data.Quests.Quests.map((quest) => ({
              title: quest.Title,
              difficulty: quest.Difficulty,
              status: quest.Status,
              members: quest.Members,
              questPoints: quest.QuestPoints,
              userEligible: quest.Eligible,
            })),
          },
        },
      });

      // update player's last fetched timestamp
      await prisma.player.update({
        where: { id: playerRow.id },
        data: { lastFetchedAt: new Date() },
      });

      // cache fresh data in redis with expiry for auto-refresh window
      await redis.set(
        cacheKey,
        JSON.stringify({
          data,
          fetchedAt: Date.now(),
        }),
        {
          expiration: {
            type: 'PX',
            value: config.TIMINGS.AUTO_REFRESH,
          },
        },
      );

      // release the redis lock now that refresh is complete
      await redis.del(getRedisKey(username));

      return data;
    } catch {
      // on any error during refresh, release the lock to avoid deadlock
      await redis.del(getRedisKey(username));
    }

    // if fetching fresh data failed, try to return the latest snapshot from the DB
    const playerWithSnapshots = await prisma.player.findUnique({
      where: { username },
      include: {
        snapshots: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          include: { skills: true, quests: true },
        },
      },
    });

    if (playerWithSnapshots && playerWithSnapshots.snapshots.length) {
      const latest = playerWithSnapshots.snapshots[0];

      // reconstruct PlayerData shape from latest snapshot DB data
      const player: PlayerData = {
        Username: playerWithSnapshots.username,
        LoggedIn: latest.loggedIn,
        Skills: {
          Level: latest.totalSkill,
          CombatLevel: latest.combatLevel,
          XP: latest.totalXp,
          Rank: latest.rank.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
          Skills: latest.skills.map((skill) => ({
            JagexID: IdMap[skill.name] ?? -1,
            HumanName: skill.name,
            Level: BigInt(skill.level),
            XP: BigInt(skill.xp),
            Rank: skill.rank,
          })),
        },
        Quests: {
          Completed: latest.quests_completed,
          InProgress: latest.quests_in_progress,
          NotStarted: latest.quests_not_started,
          Quests: latest.quests.map((quest) => ({
            Title: quest.title,
            Difficulty: quest.difficulty,
            Status: quest.status as 'COMPLETED' | 'STARTED' | 'NOT_STARTED',
            Members: quest.members,
            QuestPoints: quest.questPoints,
            Eligible: quest.userEligible,
          })),
        },
      };

      return player;
    }

    // if no snapshot found, return a fallback empty player data
    return {
      Username: playerRow.username,
      LoggedIn: false,
      Skills: {
        Level: 0n,
        CombatLevel: 0n,
        XP: 0n,
        Rank: '',
        Skills: [],
      },
      Quests: {
        Completed: 0,
        InProgress: 0,
        NotStarted: 0,
        Quests: [],
      },
    };
  }

  // if can't refresh due to lock, try returning cached data anyway to avoid empty responses
  const cachedRawFallback = await redis.get(cacheKey);
  if (cachedRawFallback) {
    try {
      const cached = JSON.parse(cachedRawFallback);
      return cached.data;
    } catch {
      // corrupted cache, ignore
    }
  }

  // final fallback empty player if nothing else works
  return {
    Username: username,
    LoggedIn: false,
    Skills: {
      Level: 0n,
      CombatLevel: 0n,
      XP: 0n,
      Rank: '',
      Skills: [],
    },
    Quests: {
      Completed: 0,
      InProgress: 0,
      NotStarted: 0,
      Quests: [],
    },
  };
}

export async function getWeeklyXpByDay(username: string) {
  const now = new Date();
  const startDate = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

  const snapshots = await prisma.playerSnapshot.findMany({
    where: {
      player: { username },
      timestamp: { gte: startDate },
    },
    orderBy: { timestamp: 'asc' },
    select: { totalXp: true, timestamp: true },
  });

  if (snapshots.length === 0) {
    return Array.from({ length: 7 }, (_, i) => ({
      date: `Day ${i + 1}`,
      dailyXP: 0,
    }));
  }

  const snapshotsByDate = new Map<string, { totalXp: bigint; timestamp: Date }>();

  for (const snap of snapshots) {
    const dateKey = snap.timestamp.toISOString().slice(0, 10);
    const existing = snapshotsByDate.get(dateKey);
    if (!existing || snap.timestamp > existing.timestamp) {
      snapshotsByDate.set(dateKey, {
        totalXp: BigInt(snap.totalXp),
        timestamp: snap.timestamp,
      });
    }
  }

  const dateStrings: string[] = [];
  for (let i = 7; i >= 1; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dateStrings.push(d.toISOString().slice(0, 10));
  }

  const day0Date = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
  const day0Key = day0Date.toISOString().slice(0, 10);
  const day0Xp = snapshotsByDate.get(day0Key)?.totalXp ?? 0n;

  const xpData = [];

  let prevXp = day0Xp;

  for (let i = 0; i < dateStrings.length; i++) {
    const xpForDay = snapshotsByDate.get(dateStrings[i])?.totalXp ?? prevXp;
    const dailyXp = xpForDay - prevXp;
    xpData.push({
      date: `Day ${i + 1}`,
      dailyXP: Number(dailyXp > 0n ? dailyXp : 0n),
    });
    prevXp = xpForDay;
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
  for (const [playerId, snap] of day0Map) {
    prevXpByPlayer.set(playerId, snap.totalXp);
  }

  const results: { date: string; dailyXP: number }[] = [];

  for (const dateKey of allDates) {
    const currentMap = groupedByDateAndPlayer.get(dateKey) ?? new Map();
    let totalXp = 0n;

    for (const [playerId, snap] of currentMap) {
      const prev = prevXpByPlayer.get(playerId) ?? 0n;
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

  const byPlayer = new Map<
    string,
    { username: string; firstXp: bigint; lastXp: bigint }
  >();

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

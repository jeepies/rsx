import config from '~/services/config.server';
import { prisma } from '~/services/prisma.server';
import redis from '~/services/redis.server';
import { RuneMetrics } from '~/services/runescape.server';
import { IdMap } from '~/~constants/SkillMap';
import { CachedPlayerData, PlayerData } from '~/~types/PlayerData';

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

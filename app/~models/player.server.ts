import config from '~/services/config.server';
import { prisma } from '~/services/prisma.server';
import redis from '~/services/redis.server';
import { RuneMetrics } from '~/services/runescape.server';
import { IdMap, SkillMap } from '~/~constants/SkillMap';
import { CachedPlayerData, PlayerData } from '~/~types/PlayerData';
import { Skill } from '~/~types/Skill';

function getRedisKey(username: string): string {
  return `rsn:lock:${username}`;
}

function getCacheKey(username: string): string {
  return `rsn:fresh:${username}`;
}

export async function canRefresh(username: string): Promise<boolean> {
  const isLocked = await redis.get(getRedisKey(username));
  return !isLocked;
}

export async function getRefreshTimestamp(rsn: string) {
  const timestamp = await redis.expireTime(getRedisKey(rsn));
  return timestamp;
}

export async function commitLock(rsn: string): Promise<void> {
  await redis.set(getRedisKey(rsn), '1', {
    expiration: { type: 'PX', value: config.TIMINGS.FETCH_LOCK },
  });
}

export async function getFreshestData(username: string) {
  const cacheKey = getCacheKey(username);

  const cachedRaw = await redis.get(cacheKey);
  if (cachedRaw) {
    try {
      const cached: CachedPlayerData = JSON.parse(cachedRaw);
      const now = Date.now();
      if (cached.CachedAt + config.TIMINGS.AUTO_REFRESH > now) {
        const { CachedAt, ...transformed } = cached;
        return transformed;
      }
    } catch {
      // this data is shit. lets just carry on.
    }
  }

  const playerRow = await prisma.player.upsert({
    where: { username: username },
    update: {},
    create: {
      username: username,
      lastFetchedAt: new Date(),
    },
  });

  if (await canRefresh(username)) {
    await commitLock(username);

    try {
      const data = await RuneMetrics.getFullProfile(username);

      if (typeof data === 'string') return data;

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

      await prisma.player.update({
        where: {
          id: playerRow.id,
        },
        data: {
          lastFetchedAt: new Date(),
        },
      });

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

      return data;
    } catch {
      // this data is also wank.
    }

    const playerWithSnapshots = await prisma.player.findUnique({
      where: {
        username: username,
      },
      include: {
        snapshots: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 1,
          include: {
            skills: true,
            quests: true,
          },
        },
      },
    });

    if (playerWithSnapshots && playerWithSnapshots.snapshots.length) {
      const latest = playerWithSnapshots.snapshots[0];

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

    // oh fuck.
    const fallbackPlayer: PlayerData = {
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
    return fallbackPlayer;
  }
}

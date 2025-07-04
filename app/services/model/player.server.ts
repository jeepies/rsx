import config from '../config.server';
import { prisma } from '../prisma.server';
import redis from '../redis.server';
import { TransformedPlayerData, transformPlayerData } from '../transformers/player.server';
import { RunescapeAPI } from '~/services/runescape.server';

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

/**
 * Commit a lock to redis
 * @param rsn Runescape Name
 */
export async function commitLock(rsn: string): Promise<void> {
  await redis.set(getRedisKey(rsn), '1', { EX: config.TIMINGS.FETCH_LOCK });
}

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

  if (await canRefresh(rsn)) {
    await commitLock(rsn);

    try {
      const rawProfile = await RunescapeAPI.fetchRuneMetricsProfile(rsn);

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

      // upsert player, but the long way.
      let player = await prisma.player.findUnique({ where: { username: rsn } });
      if (!player) {
        player = await prisma.player.create({
          data: {
            username: rsn,
            lastFetchedAt: new Date(),
          },
        });
      }

      // create a snapshot of this moment
      await prisma.playerSnapshot.create({
        data: {
          playerId: player.id,
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
        },
      });

      // update the lastFetchedAt date
      await prisma.player.update({
        where: { id: player.id },
        data: { lastFetchedAt: new Date() },
      });

      // cache it please
      await redis.set(cacheKey, JSON.stringify({ ...transformedData, fetchedAt: Date.now() }), {
        EX: config.TIMINGS.AUTO_REFRESH,
      });

      return transformedData;
    } catch (error) {
      console.error(`Fetch failed for ${rsn}:`, error);
      // lets just get the stale old db record :(
    }

    const player = await prisma.player.findUnique({
      where: { username: rsn },
      include: {
        snapshots: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          include: {
            skills: true,
            activities: true,
          },
        },
      },
    });

    // i had to cover my eyes writing this
    if (player?.snapshots?.[0]) {
      const latest = player.snapshots[0];
      return {
        username: player.username,
        rank: latest.rank,
        totalXp: latest.totalXp,
        totalSkill: latest.totalSkill,
        combatLevel: latest.combatLevel,
        loggedIn: latest.loggedIn,
        skills: latest.skills.reduce(
          (acc, skill) => {
            acc[skill.name] = {
              xp: Number(skill.xp),
              level: skill.level,
              rank: skill.rank,
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
      };
    }

    // achievement got: how did we end up here
    const created = await prisma.player.create({
      data: { username: rsn },
    });

    return {
      username: created.username,
      rank: 0,
      totalXp: 0,
      totalSkill: 0,
      combatLevel: 0,
      loggedIn: false,
      skills: {},
      activities: [],
    };
  }
}

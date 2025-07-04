import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { sleep, toJsonValue } from '~/lib/utils';
import config from '~/services/config.server';
import { prisma } from '~/services/prisma.server';
import redis from '~/services/redis.server';
import { RuneMetricsProfileFormatted, RunescapeAPI } from '~/services/runescape.server';

export async function loader({ params }: LoaderFunctionArgs) {
  const rsn = params.rsn?.toLowerCase().trim();
  if (!rsn) throw new Response('Missing RSN', { status: 400 });
  await updatePlayer(rsn);
  return { success: 'idk' };
}

export async function action({ params }: ActionFunctionArgs) {
  const rsn = params.rsn?.toLowerCase().trim();
  if (!rsn) throw new Response('Missing RSN', { status: 400 });
  updatePlayer(rsn);
  return { success: 'idk' };
}

function parsePlayerData(rawData: unknown): RuneMetricsProfileFormatted {
  const parsed = RunescapeAPI.safeParse<RuneMetricsProfileFormatted>(rawData);
  if (!parsed) throw new Response('Player data corrupted', { status: 500 });
  return parsed;
}

async function updatePlayer(rsn: string) {
  const start = Date.now();
  let player = await prisma.player.findUnique({ where: { rsn } });
  if (!player) throw new Response('Player not found', { status: 404 });
  let data;
  try {
    data = await RunescapeAPI.fetchRuneMetricsProfile(rsn);
  } catch {
    data = parsePlayerData(player.data);
  }

  const redisKey = `rsn:lock:${rsn}`;

  player = await prisma.player.updateData(JSON.parse(JSON.stringify(data)), {
    rsn: rsn,
  });

  await redis.set(redisKey, '1', { EX: config.TIMINGS.FETCH_LOCK });

  const elapsed = Date.now() - start;
  if (elapsed < config.TIMINGS.MIN_SKELETON_TIME) {
    await sleep(config.TIMINGS.MIN_SKELETON_TIME - elapsed);
  }

  return {
    player: { ...player, data },
    chatHead: RunescapeAPI.getChatheadUrl(rsn),
    minutesSince: 0,
  };
}

import { LoaderFunctionArgs } from '@remix-run/node';
import {
  isRouteErrorResponse,
  useLoaderData,
  useLocation,
  useNavigation,
  useParams,
  useRouteError,
} from '@remix-run/react';
import { PlayerProfileSkeleton } from '~/components/player-profile/skeleton';
import { Card, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import config from '~/services/config.server';
import { prisma } from '~/services/prisma.server';
import redis from '~/services/redis.server';
import { RuneMetricsProfileFormatted, RunescapeAPI } from '~/services/runescape.server';
import PlayerNotFound from '~/components/player-profile/not-found';
import PlayerProfile from '~/components/player-profile/profile';
import { sleep, toJsonValue } from '~/lib/utils';

function parsePlayerData(rawData: unknown): RuneMetricsProfileFormatted {
  const parsed = RunescapeAPI.safeParse<RuneMetricsProfileFormatted>(rawData);
  if (!parsed) throw new Response('Player data corrupted', { status: 500 });
  return parsed;
}

export async function loader({ params }: LoaderFunctionArgs) {
  const start = Date.now();

  const rsn = params.rsn?.toLowerCase().trim();
  if (!rsn) throw new Response('Missing RSN', { status: 400 });

  const now = new Date();
  const redisKey = `rsn:lock:${rsn}`;

  let player = await prisma.player.findUnique({ where: { rsn } });

  if (!player) {
    let data;
    try {
      data = await RunescapeAPI.fetchRuneMetricsProfile(rsn);
    } catch {
      throw new Response('Player not found', { status: 404 });
    }

    const jsonData = toJsonValue(data);

    player = await prisma.player.create({
      data: { rsn, data: JSON.parse(JSON.stringify(jsonData)), lastFetched: now },
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

  const minutesSince = (now.getTime() - new Date(player.lastFetched).getTime()) / 60000;

  if (minutesSince > config.TIMINGS.AUTO_REFRESH / 60) {
    let data;
    try {
      data = await RunescapeAPI.fetchRuneMetricsProfile(rsn);
    } catch {
      data = parsePlayerData(player.data);
    }

    const jsonData = toJsonValue(data);

    player = await prisma.player.update({
      where: { rsn },
      data: { data: JSON.parse(JSON.stringify(jsonData)), lastFetched: now },
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

  const parsedData = parsePlayerData(player.data);

  const elapsed = Date.now() - start;
  if (elapsed < config.TIMINGS.MIN_SKELETON_TIME) {
    await sleep(config.TIMINGS.MIN_SKELETON_TIME - elapsed);
  }

  return {
    player: { ...player, data: parsedData },
    chatHead: RunescapeAPI.getChatheadUrl(rsn),
    minutesSince,
  };
}

export default function PlayerPage() {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const params = useParams();

  const rsnKey = params.rsn?.toLowerCase() || 'unknown';

  let nextRSN: string | null = null;
  if (navigation.location?.pathname) {
    const parts = navigation.location.pathname.split('/');
    nextRSN = parts.length > 2 ? parts[2].toLowerCase() : null;
  }

  const isLoadingDifferentPlayer =
    navigation.state === 'loading' && nextRSN && nextRSN !== params.rsn?.toLowerCase();

  if (
    isLoadingDifferentPlayer ||
    navigation.state === 'loading' ||
    navigation.state === 'submitting'
  ) {
    return <PlayerProfileSkeleton key={`skeleton-${rsnKey}`} />;
  }

  if (!data) {
    return <PlayerNotFound RSN={params.rsn || ''} key={`notfound-${rsnKey}`} />;
  }

  return <PlayerProfile data={data} key={`profile-${rsnKey}`}  />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <PlayerNotFound RSN={error.statusText || ''} />;
    }
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg mx-auto animate-fade-in">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl mb-2">Error {error.status}</CardTitle>
            <CardDescription className="text-base">'Something went wrong.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto animate-fade-in">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl mb-2">Unexpected Error</CardTitle>
          <CardDescription className="text-base">An unexpected error occurred.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

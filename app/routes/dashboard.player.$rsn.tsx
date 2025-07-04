import type { LoaderFunctionArgs } from '@remix-run/node';
import {
  isRouteErrorResponse,
  useLoaderData,
  useNavigation,
  useParams,
  useRouteError,
} from '@remix-run/react';
import { PlayerProfileSkeleton } from '~/components/player-profile/skeleton';
import { Card, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import config from '~/services/config.server';
import { RunescapeAPI } from '~/services/runescape.server';
import PlayerNotFound from '~/components/player-profile/not-found';
import PlayerProfile from '~/components/player-profile/profile';
import { sanitizeBigInts, sleep } from '~/lib/utils';
import { getFreshestData } from '~/services/model/player.server';
import { prisma } from '~/services/prisma.server';

export async function loader({ params }: LoaderFunctionArgs) {
  const start = Date.now();
  const rsn = params.rsn?.toLowerCase().trim();
  if (!rsn) throw new Response('Missing RSN', { status: 400 });

  let playerData;
  try {
    playerData = await getFreshestData(rsn);
  } catch(e) {
    throw new Response('Player not found', { status: 404 });
  }

  if (!playerData) throw new Response('Player not found', { status: 404 });

  const playerMeta = await prisma.player.findUnique({
    where: { username: rsn },
  });

  if (!playerMeta) {
    throw new Response('Player not found', { status: 404 });
  }

  const elapsed = Date.now() - start;
  if (elapsed < config.TIMINGS.MIN_SKELETON_TIME) {
    await sleep(config.TIMINGS.MIN_SKELETON_TIME - elapsed);
  }

  const sanitizedPlayerData = sanitizeBigInts(playerData);
  const sanitizedPlayerMeta = sanitizeBigInts(playerMeta);

  return {
    player: {
      id: sanitizedPlayerMeta.id,
      rsn: sanitizedPlayerMeta.username,
      data: sanitizedPlayerData,
      lastFetched: sanitizedPlayerMeta.lastFetchedAt,
      createdAt: sanitizedPlayerMeta.createdAt,
      updatedAt: sanitizedPlayerMeta.updatedAt,
    },
    chatHead: RunescapeAPI.getChatheadUrl(rsn),
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
    return <PlayerNotFound RSN={params.rsn || ''} />;
  }

  return <PlayerProfile data={data} key={`profile-${rsnKey}`} />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  console.log(error);

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <PlayerNotFound RSN={error.statusText || ''} />;
    }
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg mx-auto animate-fade-in">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl mb-2">Error {error.status}</CardTitle>
            <CardDescription className="text-base">Something went wrong.</CardDescription>
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

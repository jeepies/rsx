import { LoaderFunctionArgs } from '@remix-run/node';
import { isRouteErrorResponse, useLoaderData, useParams, useRouteError } from '@remix-run/react';
import PlayerNotFound from './not-found';
import { Card, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { getFreshestData, getWeeklyXpByDay } from '~/~models/player.server';
import { prisma } from '~/services/prisma.server';
import { sanitizeBigInts } from '~/lib/utils';
import { PlayerData } from '~/~types/PlayerData';
import { RuneMetrics } from '~/services/runescape.server';
import Header from './header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import OverviewTab from './tabs/overview';
import { QuestsTab } from '~/components/player-profile/quests-tab';

export async function loader({ params }: LoaderFunctionArgs) {
  const rsn = params.rsn?.toLowerCase().trim();
  if (!rsn) throw new Response('Missing RSN', { status: 400 });

  const data = await getFreshestData(rsn);
  if (typeof data === 'string') throw new Response(data, { status: 404 });

  const meta = await prisma.player.findUnique({
    where: {
      username: rsn,
    },
  });

  const player: PlayerData = sanitizeBigInts(data);

  const [weeklyXp] = await Promise.all([getWeeklyXpByDay(rsn)]);

  return {
    player,
    stats: {
      weeklyXp,
    },
    meta,
    chatheadURI: RuneMetrics.getChatheadURI(rsn),
  };
}

export default function PlayerProfile() {
  const data = useLoaderData<typeof loader>();
  const params = useParams();

  if (!data) {
    return <PlayerNotFound RSN={params.rsn || ''} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Header data={data} />

      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">
            Overview
          </TabsTrigger>
          <TabsTrigger value="skills" className="text-xs sm:text-sm py-2">
            Skills
          </TabsTrigger>
          <TabsTrigger value="quests" className="text-xs sm:text-sm py-2">
            Quests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <OverviewTab data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
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

import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import { type LoaderFunction } from '@remix-run/node';
import OverviewTab from './tabs/overview';
import PlayersTab from './tabs/players';
import { getAllPlayers } from '~/~models/player.server';
import { useLoaderData } from '@remix-run/react';

export const loader: LoaderFunction = async () => {
  if (process.env.NODE_ENV !== 'development') {
    throw new Response('Not Found', { status: 404 });
  }

  const players = await getAllPlayers();

  return {
    players
  };
};

export default function DevOnlyRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">
            Overview
          </TabsTrigger>
          <TabsTrigger value="players" className="text-xs sm:text-sm py-2">
            Players
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="players" className="space-y-4 sm:space-y-6">
          <PlayersTab players={data.players} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useLoaderData, useNavigate } from '@remix-run/react';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';
import {
  getHighestTotalLevelPlayers,
  getMostRecentlyUpdatedPlayers,
  getMostViewedPlayers,
} from '~/~models/player.server';
import HallOfFame from './hall-of-fame';
import RecentPlayers from './recent-players';

export async function loader() {
  const [mostViewed, topPlayers, recentlyUpdated] = await Promise.all([
    getMostViewedPlayers(5),
    getHighestTotalLevelPlayers(),
    getMostRecentlyUpdatedPlayers(),
  ]);

  return {
    mostViewed,
    topPlayers,
    recentlyUpdated,
  };
}

{
  /* TODO add translation */
}

export default function Players() {
  const { mostViewed, topPlayers, recentlyUpdated } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">{t('pages.players.title')}</h1>
        <p className="text-muted-foreground">{t('pages.players.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <HallOfFame mostViewed={mostViewed} />
        <RecentPlayers recentlyActive={recentlyUpdated}/>
      </div>
    </div>
  );
}

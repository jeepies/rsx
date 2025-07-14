import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { TrendingUp, Eye, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '~/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';
import { getHighestTotalLevelPlayers, getMostViewedPlayers } from '~/~models/player.server';

export async function loader() {
  const [mostViewed, topPlayers] = await Promise.all([
    getMostViewedPlayers(),
    getHighestTotalLevelPlayers(),
  ]);

  return {
    mostViewed,
    topPlayers,
  };
}

export default function Players() {
  const { mostViewed, topPlayers } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">{t('pages.players.title')}</h1>
        <p className="text-muted-foreground">{t('pages.players.description')}</p>
      </div>

      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            {t('pages.players.most_searched.title')}
          </CardTitle>
          <CardDescription>{t('pages.players.most_searched.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mostViewed.map((player, index) => (
              <Card
                key={player.username}
                className="transition-smooth hover:shadow-md cursor-pointer animate-fade-in hover:scale-105"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => navigate(`/dashboard/player/${player.username}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{player.username}</h3>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{t('pages.players.total_level')}</span>
                      <span className="font-medium">{Number(player.totalLevel)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{t('pages.players.most_searched.profile_views')}</span>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span className="font-medium">{player.viewCount}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {t('pages.players.top_players.title')}
          </CardTitle>
          <CardDescription>{t('pages.players.top_players.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {topPlayers.map((player, index) => (
              <Card
                key={player.username}
                className="transition-smooth hover:shadow-md cursor-pointer animate-fade-in hover:scale-105"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => navigate(`/dashboard/player/${player.username}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{player.username}</h3>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{t('pages.players.total_level')}</span>
                      <span className="font-medium">{Number(player.totalLevel)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

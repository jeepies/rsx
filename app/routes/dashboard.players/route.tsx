import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { TrendingUp, Eye } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';
import { getMostViewedPlayers } from '~/~models/player.server';

export async function loader() {
  const [mostViewed] = await Promise.all([getMostViewedPlayers()]);

  return {
    mostViewed,
  };
}

export default function Players() {
  const { mostViewed } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Players</h1>
        <p className="text-muted-foreground">Discover popular RuneScape players and their stats</p>
      </div>

      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Most Searched Players (24h)
          </CardTitle>
          <CardDescription>
            Popular players that are frequently viewed by the community
          </CardDescription>
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
                      <span>Total Level:</span>
                      <span className="font-medium">{Number(player.totalLevel)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Profile Views:</span>
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
    </div>
  );
}

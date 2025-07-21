import { useNavigate } from '@remix-run/react';
import { formatDistance } from 'date-fns';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';

export interface RecentPlayersProps {
  recentlyActive: {
    username: string;
    lastUpdated: Date;
    totalLevel: bigint;
  }[];
}

export default function RecentPlayers(props: Readonly<RecentPlayersProps>) {
  const { recentlyActive } = props;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const key = "pages.players.recent_players";

  const now = new Date();

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          {t(`${key}.title`)}
        </CardTitle>
        <CardDescription>{t(`${key}.description`)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentlyActive.map((player, index) => (
            <div
              key={player.username}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
              onClick={() => navigate(`/dashboard/player/${player.username}`)}
            >
              <div>
                <h4 className="font-semibold">{player.username}</h4>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Level {Number(player.totalLevel)}</p>
                <p className="text-xs text-muted-foreground">{formatDistance(now, player.lastUpdated, { includeSeconds: true })}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

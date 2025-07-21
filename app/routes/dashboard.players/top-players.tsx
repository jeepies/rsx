import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';
import { useNavigate } from '@remix-run/react';
import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

export interface TopPlayersProps {
  topPlayers: {
    playerId: string;
    username: string;
    totalLevel: bigint;
  }[];
}

export default function TopPlayers(props: Readonly<TopPlayersProps>) {
  const { topPlayers } = props;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const key = 'pages.players.top_players';

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          {t(`${key}.title`)}
        </CardTitle>
        <CardDescription>{t(`${key}.description`)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topPlayers.map((player) => (
            <div
              key={player.username}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
              onClick={() => navigate(`/dashboard/player/${player.username}`)}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 text-primary font-bold">
                  <Avatar className="w-10 h-10 flex items-center justify-center text-sm font-bold">
                    <AvatarImage
                      src={`https://secure.runescape.com/m=avatar-rs/${player.username}/chat.png`}
                      alt={`${player.username}'s avatar`}
                    />
                    <AvatarFallback className="w-16 h-16 sm:w-20 sm:h-20 bg-primary text-xl sm:text-2xl font-bold text-primary-foreground">
                      {player.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h4 className="font-semibold">{player.username}</h4>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {t(`${key}.level`)} {Number(player.totalLevel)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

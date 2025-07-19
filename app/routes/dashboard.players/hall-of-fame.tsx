import { useNavigate } from '@remix-run/react';
import { Crown, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';

export interface HallOfFameProps {
  mostViewed: {
    playerId: string;
    username: string;
    viewCount: number;
    totalLevel: bigint | null;
  }[];
}

export default function HallOfFame(props: Readonly<HallOfFameProps>) {
  const { mostViewed } = props;
  const navigate = useNavigate();

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Hall of Fame
        </CardTitle>
        <CardDescription>Most viewed players of all time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mostViewed.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground text-xl">Its lonely here...</p>
            </div>
          ) : (
            mostViewed.map((player, index) => (
              <div
                key={player.username}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                onClick={() => navigate(`/dashboard/player/${player.username}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold">{player.username}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Eye className="h-3 w-3" />
                    {player.viewCount}
                  </div>
                  <p className="text-xs text-muted-foreground">Level {Number(player.totalLevel)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

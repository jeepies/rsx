import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { TooltipTrigger, TooltipContent } from '@radix-ui/react-tooltip';
import { useFetcher } from '@remix-run/react';
import { RefreshCw } from 'lucide-react';
import FavouriteProfileButton from '~/components/player-profile/favourite-button';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardHeader } from '~/components/ui/card';
import { Tooltip } from '~/components/ui/tooltip';
import { PlayerData } from '~/~types/PlayerData';

export interface HeaderComponentProps {
  data: {
    player: PlayerData;
    chatheadURI: string;
  };
}

export default function Header(props: Readonly<HeaderComponentProps>) {
  const { player } = props.data;
  const fetcher = useFetcher();

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
              <AvatarImage
                src={`https://secure.runescape.com/m=avatar-rs/${player.Username}/chat.png`}
                alt={`${player.Username}'s avatar`}
              />
              <AvatarFallback className="w-16 h-16 sm:w-20 sm:h-20 bg-primary text-xl sm:text-2xl font-bold text-primary-foreground">
                {player.Username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold truncate">{player.Username}</h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                <Badge variant="outline" className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Online
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <fetcher.Form method="get" action={`/api/refresh/${player.Username}`}>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 flex-1 sm:flex-none"
                    type="submit"
                    disabled={true}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {/* <p>
                    {canRefresh
                      ? 'Refresh this users data'
                      : formatDistance(now, refreshTimestampDate, { includeSeconds: true })}
                  </p> */}
                </TooltipContent>
              </Tooltip>
            </fetcher.Form>
            <FavouriteProfileButton RSN={player.Username} />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

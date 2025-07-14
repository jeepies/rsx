import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';
import { useNavigate } from '@remix-run/react';
import { formatDistanceToNow } from 'date-fns';

export type PlayersTabProps = {
  players: {
    id: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
    lastFetchedAt: Date;
    snapshots: {
      timestamp: Date;
    }[];
  }[];
};

export default function PlayersTab(props: Readonly<PlayersTabProps>) {
  const navigate = useNavigate();

  return (
    <>
      {props.players.map((player, idx) => {
        const latestSnapshot = [...player.snapshots]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        const snapshotTimeAgo = latestSnapshot
          ? formatDistanceToNow(new Date(latestSnapshot.timestamp), { addSuffix: true })
          : 'No snapshots yet';

        return (
          <div
            key={idx}
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-smooth animate-fade-in cursor-pointer"
            style={{ animationDelay: `${idx * 0.05}s` }}
            onClick={() => navigate(`/dashboard/player/${player.username}`)}
          >
            <div className="flex items-center gap-4">
              <Avatar className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold">
                <AvatarImage
                  src={`https://secure.runescape.com/m=avatar-rs/${player.username}/chat.png`}
                  alt={`${player.username}'s avatar`}
                />
                <AvatarFallback className="w-16 h-16 sm:w-20 sm:h-20 bg-primary text-xl sm:text-2xl font-bold text-primary-foreground">
                  {player.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-lg">{player.username}</div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="font-bold text-md">Last snapshot {snapshotTimeAgo}</div>
            </div>
          </div>
        );
      })}
    </>
  );
}

import { Users, Trophy, Target, Calendar, Star, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  Tooltip,
  LineChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { formatBigInt } from '~/lib/utils';
import { PlayerData } from '~/~types/PlayerData';

export interface OverviewTabProps {
  data: {
    player: PlayerData;
    stats: any;
  };
}

export default function OverviewTab(props: Readonly<OverviewTabProps>) {
  const { player, stats } = props.data;

  let questPoints = 0;
  player.Quests.Quests.filter((q) => q.Status === 'COMPLETED').forEach(
    (q) => (questPoints += q.QuestPoints),
  );

  const maxCapeRequiredSkillsCount = Object.keys(player.Skills.Skills).length;
  const maxCapeSkillsAt99 = Object.values(player.Skills.Skills).filter(
    (skill) => skill.Level >= 99,
  ).length;
  const maxCapeProgressPercent = (maxCapeSkillsAt99 / maxCapeRequiredSkillsCount) * 100;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
              <div className="text-lg font-bold">N/A</div>
              <div className="text-xs text-muted-foreground">Clan</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Trophy className="h-5 w-5 mx-auto mb-2 text-yellow-500" />
              <div className="text-lg font-bold">{formatBigInt(Number(player.Skills.Level))}</div>
              <div className="text-xs text-muted-foreground">Total Level</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Target className="h-5 w-5 mx-auto mb-2 text-green-500" />
              <div className="text-lg font-bold"> {maxCapeProgressPercent.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Max Cape</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Calendar className="h-5 w-5 mx-auto mb-2 text-blue-500" />
              <div className="text-lg font-bold">{stats.daysTracked}</div>
              <div className="text-xs text-muted-foreground">Days Tracked</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Star className="h-5 w-5 mx-auto mb-2 text-purple-500" />
              <div className="text-lg font-bold">{questPoints}</div>
              <div className="text-xs text-muted-foreground">Quest Points</div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Daily XP Progress
          </CardTitle>
          <CardDescription className="text-sm">
            Daily experience gained over the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.weeklyXp}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis
                stroke="#9CA3AF"
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                formatter={(value) => [`${(Number(value) / 1000000).toFixed(1)}M XP`, 'Daily XP']}
              />
              <Line
                type="monotone"
                dataKey="dailyXP"
                stroke="#a29bfe"
                strokeWidth={3}
                dot={{ fill: '#a29bfe' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}

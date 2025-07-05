import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Calendar, RefreshCw, Star, Target, TrendingUp, Trophy, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '../ui/table';
import { Badge } from '../ui/badge';
import FavouriteProfileButton from './favourite-button';
import { useFetcher } from '@remix-run/react';
import { Tooltip } from '@radix-ui/react-tooltip';
import { TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { formatDistance } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Progress } from '~/components/ui/progress';
import { formatBigInt } from '~/lib/utils';
import { RawQuest, translateQuests } from '~/lib/quests';
import { QuestsTab } from './quests-tab';

export interface ProfileProps {
  data: {
    player: {
      id: string;
      rsn: string;
      data: {
        username: string;
        rank: number;
        totalXp: number;
        totalSkill: number;
        combatLevel: number;
        loggedIn: boolean;
        skills: Record<string, { xp: number; level: number; rank: number }>;
        activities: any[];
      };
      lastFetched: Date;
      createdAt: Date;
      updatedAt: Date;
      dailyXpIncreases: Record<string, number>;
      dailyLevelIncreases: Record<string, number>;
      dailyRankIncrease: number;
      weeklyXp: {
        date: string;
        dailyXP: number;
      }[];
      refreshTimestamp: number;
      quests: {
        eligibleQuests: RawQuest[];
        completedQuests: RawQuest[];
        allQuests: RawQuest[];
      };
      trackedDays: number;
    };
    chatHead: string;
  };
}

interface QuestData {
  category: string;
  completed: number;
  total: number;
}

export default function PlayerProfile(props: Readonly<ProfileProps>) {
  const fetcher = useFetcher();
  const {
    data: { player, chatHead },
  } = props;

  const skillOrder: string[] = [
    'Attack',
    'Defence',
    'Strength',
    'Constitution',
    'Ranged',
    'Prayer',
    'Magic',
    'Cooking',
    'Woodcutting',
    'Fletching',
    'Fishing',
    'Firemaking',
    'Crafting',
    'Smithing',
    'Mining',
    'Herblore',
    'Agility',
    'Thieving',
    'Slayer',
    'Farming',
    'Runecrafting',
    'Hunter',
    'Construction',
    'Summoning',
    'Dungeoneering',
    'Divination',
    'Invention',
    'Archaeology',
    'Necromancy',
  ];

  const skillsData = skillOrder.map((skill) => {
    const data = player.data.skills[skill];
    if (!data) {
      return {
        skill,
        level: 0,
        xp: 0,
        virtual: 0,
        levelsTodayForSkill: 0,
        xpTodayForSkill: 0,
      };
    }
    const skillKey = skill.toLowerCase();
    return {
      skill,
      level: data.level > 99 ? 99 : data.level,
      xp: data.xp,
      virtual: data.level,
      levelsTodayForSkill: player.dailyLevelIncreases?.[skillKey] ?? 0,
      xpTodayForSkill: player.dailyXpIncreases?.[skillKey] ?? 0,
    };
  });

  const levelsToday = Object.values(player.dailyLevelIncreases).reduce((a, b) => a + b, 0);
  const xpToday = Object.values(player.dailyXpIncreases).reduce((a, b) => a + b, 0);

  const now = new Date();
  const refreshTimestampDate = new Date(player.refreshTimestamp);
  const canRefresh = refreshTimestampDate < now;

  const questsList = translateQuests(player.quests);

  let questPoints = 0;
  player.quests.completedQuests.forEach((q) => (questPoints += q.questPoints));

  const questDataMap = new Map<string, { completed: number; total: number }>();
  for (const quest of questsList) {
    const { category, status } = quest;
    if (!questDataMap.has(category)) {
      questDataMap.set(category, { completed: 0, total: 0 });
    }
    const entry = questDataMap.get(category)!;
    entry.total += 1;
    if (status === 'Complete') {
      entry.completed += 1;
    }
  }

  const questData: QuestData[] = Array.from(questDataMap.entries()).map(([category, data]) => ({
    category,
    completed: data.completed,
    total: data.total,
  }));

  const maxCapeRequiredSkillsCount = Object.keys(player.data.skills).length;
  const maxCapeSkillsAt99 = Object.values(player.data.skills).filter(
    (skill) => skill.level >= 99,
  ).length;
  const maxCapeProgressPercent = (maxCapeSkillsAt99 / maxCapeRequiredSkillsCount) * 100;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                <AvatarImage
                  src={`https://secure.runescape.com/m=avatar-rs/${player.rsn?.toLowerCase()}/chat.png`}
                  alt={`${player.data.username}'s avatar`}
                />
                <AvatarFallback className="w-16 h-16 sm:w-20 sm:h-20 bg-primary text-xl sm:text-2xl font-bold text-primary-foreground">
                  {player.data.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold truncate">{player.data.username}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                  <Badge variant="outline" className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Online
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <fetcher.Form method="get" action={`/api/refresh/${player.data.username}`}>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 flex-1 sm:flex-none"
                      type="submit"
                      disabled={!canRefresh}
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="hidden sm:inline">Refresh</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {canRefresh
                        ? 'Refresh this users data'
                        : formatDistance(now, refreshTimestampDate, { includeSeconds: true })}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </fetcher.Form>
              <FavouriteProfileButton RSN={player.data.username} />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">
            Overview
          </TabsTrigger>
          <TabsTrigger value="skills" className="text-xs sm:text-sm py-2">
            Skills
          </TabsTrigger>
          <TabsTrigger value="quests" className="text-xs sm:text-sm py-2">
            Quests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
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
                  <div className="text-lg font-bold">{formatBigInt(player.data.totalSkill)}</div>
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
                  <div className="text-lg font-bold">{formatBigInt(player.trackedDays)}</div>
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
                <LineChart data={player.weeklyXp}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis
                    stroke="#9CA3AF"
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    formatter={(value) => [
                      `${(Number(value) / 1000000).toFixed(1)}M XP`,
                      'Daily XP',
                    ]}
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
        </TabsContent>

        <TabsContent value="skills" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{props.data.player.data.totalSkill}</div>
                  <div className="text-sm text-muted-foreground">Total Level</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatBigInt(props.data.player.data.totalXp)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total XP</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{levelsToday}</div>
                  <div className="text-sm text-muted-foreground">Levels Today</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{formatBigInt(xpToday)}</div>
                  <div className="text-sm text-muted-foreground">XP Today</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                Skill Details
              </CardTitle>
              <CardDescription>
                Detailed breakdown of all skill levels and experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Skill</TableHead>
                    <TableHead className="text-right">Level</TableHead>
                    <TableHead className="text-right">Virtual</TableHead>
                    <TableHead className="text-right">Experience</TableHead>
                    <TableHead className="text-right">Levels Today</TableHead>
                    <TableHead className="text-right">XP Today</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skillsData.map((skill) => (
                    <TableRow key={skill.skill}>
                      <TableCell className="font-medium">{skill.skill}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{skill.level}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{skill.virtual}</TableCell>
                      <TableCell className="text-right">{formatBigInt(skill.xp)}</TableCell>
                      <TableCell className="text-right">
                        {skill.levelsTodayForSkill > 0 ? (
                          <Badge variant="default" className="bg-green-500">
                            {skill.levelsTodayForSkill}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {skill.xpTodayForSkill > 0 ? (
                          <span className="text-green-400 font-medium">
                            +{skill.xpTodayForSkill}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quests" className="space-y-4 sm:space-y-6">
          <QuestsTab questData={questData} questsList={questsList} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { RefreshCw } from 'lucide-react';
import { RuneMetricsProfileFormatted, SkillData } from '~/services/runescape.server';
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
    };
    chatHead: string;
  };
}

export default function PlayerProfile(props: Readonly<ProfileProps>) {
  const {
    data: { player, chatHead },
  } = props;
  const skillsData = Object.entries(player.data.skills).map(([skill, data]) => ({
    skill,
    level: data.level > 99 ? 99 : data.level,
    xp: data.xp,
    virtual: data.level,
    levelsToday: 0,
    xpToday: 0,
  }));

  // sample quest data. TODO: fill this with real data
  const questData = [
    { category: 'Novice', completed: 45, total: 50 },
    { category: 'Intermediate', completed: 38, total: 42 },
    { category: 'Experienced', completed: 28, total: 35 },
    { category: 'Master', completed: 15, total: 20 },
    { category: 'Grandmaster', completed: 8, total: 12 },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Avatar>
                  <AvatarImage className="p-2" src={chatHead} />
                  <AvatarFallback>{player.data.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold truncate">{player.data.username}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                  <Badge
                    variant="default"
                    className={`${player.data.loggedIn ? `bg-green-500` : `bg-red-500`} text-xs sm:text-sm`}
                  >
                    {player.data.loggedIn ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {/* <fetcher.Form method="get" action={`/api/refresh/${player.data.name}`}>
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
                        : formatDistance(now, then, { includeSeconds: true })}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </fetcher.Form> */}
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
          ...
        </TabsContent>

        <TabsContent value="skills" className="space-y-4 sm:space-y-6">
          {/* Skills Summary Cards */}
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
                  <div className="text-2xl font-bold">{formatBigInt(props.data.player.data.totalXp)}</div>
                  <div className="text-sm text-muted-foreground">Total XP</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Levels Today</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">0</div>
                  <div className="text-sm text-muted-foreground">XP Today</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Skill Details</CardTitle>
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
                  {skillsData.map((skill) => {
                    let xpSinceYesterdayRecord: SkillData = { xp: 0, level: 0, rank: 0 };
                    // if (
                    //   typeof props.data.xpSinceYesterday === 'object' &&
                    //   props.data.xpSinceYesterday !== null
                    // ) {
                    //   xpSinceYesterdayRecord = props.data.xpSinceYesterday[skill.skill] ?? {};
                    // }

                    return (
                      <TableRow key={skill.skill}>
                        <TableCell className="font-medium">{skill.skill}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{skill.level}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{skill.virtual}</TableCell>
                        <TableCell className="text-right">{formatBigInt(skill.xp)}</TableCell>
                        <TableCell className="text-right">
                          {xpSinceYesterdayRecord.level > 0 ? (
                            <Badge variant="default" className="bg-green-500">
                              {xpSinceYesterdayRecord.level}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {xpSinceYesterdayRecord.xp > 0 ? (
                            <span className="text-green-400 font-medium">
                              +{xpSinceYesterdayRecord.xp}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quests" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quest Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={questData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="category" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    />
                    <Bar dataKey="completed" fill="#a29bfe" />
                    <Bar dataKey="total" fill="#374151" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quest Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {questData.map((category, index) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{category.category}</span>
                        <span>
                          {category.completed}/{category.total}
                        </span>
                      </div>
                      <Progress
                        value={(category.completed / category.total) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

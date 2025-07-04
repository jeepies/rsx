import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { RefreshCw, Heart } from 'lucide-react';
import { RuneMetricsProfileFormatted } from '~/services/runescape.server';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '../ui/table';
import { Badge } from '../ui/badge';
import FavouriteProfileButton from './favourite-button';

interface ProfileProps {
  data: {
    player: {
      id: string;
      rsn: string;
      data: RuneMetricsProfileFormatted;
      lastFetched: Date;
      createdAt: Date;
      updatedAt: Date;
    };
    chatHead: string;
    minutesSince: number;
  };
}

export default function PlayerProfile(props: Readonly<ProfileProps>) {
  const {
    data: { player, chatHead, minutesSince },
  } = props;
  const skillsData = Object.entries(player.data.formattedSkills).map(([skill, data]) => ({
    skill,
    level: data.level > 99 ? 99 : data.level,
    xp: data.xp,
    virtual: data.level,
    levelsToday: 0,
    xpToday: 0,
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Avatar>
                  <AvatarImage className="p-2" src={chatHead} />
                  <AvatarFallback>{player.data.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold truncate">{player.data.name}</h1>
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
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 flex-1 sm:flex-none"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <FavouriteProfileButton RSN={player.data.name}/>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">
            Overview
          </TabsTrigger>
          <TabsTrigger value="skills" className="text-xs sm:text-sm py-2">
            Skills
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          ...
        </TabsContent>

        <TabsContent value="skills" className="space-y-4 sm:space-y-6">
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
                  {skillsData.map((skill) => (
                    <TableRow key={skill.skill}>
                      <TableCell className="font-medium">{skill.skill}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{skill.level}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{skill.virtual}</TableCell>
                      <TableCell className="text-right">{skill.xp.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        {skill.levelsToday > 0 ? (
                          <Badge variant="default" className="bg-green-500">
                            {skill.levelsToday}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {skill.xpToday > 0 ? (
                          <span className="text-green-400 font-medium">
                            +{skill.xpToday.toLocaleString()}
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
      </Tabs>
    </div>
  );
}

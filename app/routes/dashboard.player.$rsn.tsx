import { Avatar } from '@radix-ui/react-avatar';
import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Heart, RefreshCw, UserX } from 'lucide-react';
import { AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '~/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { RunescapeAPI } from '~/services/runescape.server';

export async function loader({ params }: LoaderFunctionArgs) {
  const searchedRSN = params.rsn;

  if (!searchedRSN || searchedRSN.length < 1 || searchedRSN.length > 12)
    return { error: true, rsn: searchedRSN };

  const profile = await RunescapeAPI.fetchRuneMetricsProfile(searchedRSN);

  const chathead = RunescapeAPI.getChatheadUrl(searchedRSN);

  return { data: profile, rsn: searchedRSN, chathead: chathead };
}

const PlayerNotFound = (rsn?: string) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto animate-fade-in">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center p-2">
              <UserX className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl mb-2">Player Not Found</CardTitle>
          <CardDescription className="text-base">
            {rsn ? (
              <>
                We couldn't find a player named "
                <span className="font-semibold text-foreground">{rsn}</span>"
              </>
            ) : (
              'The requested player could not be found'
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default function PlayerPage() {
  const data = useLoaderData<typeof loader>();

  if (data?.error) return PlayerNotFound(data.rsn);

  const skillsData = Object.entries(data.data!.formattedSkills).map(([skill, data]) => ({
    skill,
    level: data.level,
    xp: data.xp,
    virtual: data.level,    // example: virtual level = current level
    levelsToday: 0,         // default, or compute if you want
    xpToday: 0              // default, or compute if you want
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Avatar>
                  <AvatarImage className="p-2" src={data.chathead} />
                  <AvatarFallback>{data.rsn?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold truncate">{data.rsn}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                  <Badge
                    variant="default"
                    className={`${data.data?.loggedIn ? `bg-green-500` : `bg-red-500`} text-xs sm:text-sm`}
                  >
                    {data.data?.loggedIn ? 'Online' : 'Offline'}
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
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2 flex-1 sm:flex-none"
              >
                <Heart className={`h-4 w-4`} />
                <span className="hidden sm:inline">Favourite</span>
              </Button>
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
                          <Badge variant="default" className="bg-green-500">{skill.levelsToday}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {skill.xpToday > 0 ? (
                          <span className="text-green-400 font-medium">+{skill.xpToday.toLocaleString()}</span>
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

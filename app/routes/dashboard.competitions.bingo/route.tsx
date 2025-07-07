import { Clock, Grid3X3, Medal, Plus, Target, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { formatDistance } from 'date-fns';
import { Badge } from '~/components/ui/badge';
import CreateBingoModal from './create-modal';

export default function XPCompetitions() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('active');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const chatGPTBingo = [
    {
      id: 1,
      name: 'Lumbridge Lottery',
      participants: 24,
      status: 'active',
      progress: 45,
      createdAt: '2025-07-07T10:00:00Z',
      startsAt: '2025-07-07T10:15:00Z',
      expiresAt: '2025-07-07T12:00:00Z',
      difficulty: 'easy',
    },
    {
      id: 2,
      name: 'Varrock Square Showdown',
      participants: 18,
      status: 'upcoming',
      progress: 0,
      createdAt: '2025-07-07T15:00:00Z',
      startsAt: '2025-07-07T15:30:00Z',
      expiresAt: '2025-07-07T17:00:00Z',
      difficulty: 'medium',
    },
    {
      id: 3,
      name: 'Gielinor Grand Bingo',
      participants: 30,
      status: 'completed',
      progress: 100,
      createdAt: '2025-07-06T20:00:00Z',
      startsAt: '2025-07-06T20:30:00Z',
      expiresAt: '2025-07-06T22:00:00Z',
      difficulty: 'hard',
    },
    {
      id: 4,
      name: 'Taverley Ticket Toss',
      participants: 12,
      status: 'active',
      progress: 60,
      createdAt: '2025-07-07T09:00:00Z',
      startsAt: '2025-07-07T09:10:00Z',
      expiresAt: '2025-07-07T11:00:00Z',
      difficulty: 'medium',
    },
    {
      id: 5,
      name: 'Prifddinas Prize Pool',
      participants: 20,
      status: 'upcoming',
      progress: 0,
      createdAt: '2025-07-07T18:00:00Z',
      startsAt: '2025-07-07T18:30:00Z',
      expiresAt: '2025-07-07T20:00:00Z',
      difficulty: 'hard',
    },
  ];

  const activeBingos = chatGPTBingo.filter((b) => b.status === 'active');
  const upcomingBingos = chatGPTBingo.filter((b) => b.status === 'upcoming');
  const completedBingos = chatGPTBingo.filter((b) => b.status === 'completed');
  const now = new Date();

  const difficultyToColour = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Grid3X3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            {t('pages.bingo_competition.title')}
          </h1>
          <p className="text-muted-foreground mt-2">{t('pages.bingo_competition.description')}</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4" />
          {t('pages.bingo_competition.create_competition')}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-ful grid-cols-3">
          <TabsTrigger value="active">{t('pages.bingo_competition.tabs.active.name')}</TabsTrigger>
          <TabsTrigger value="upcoming">
            {t('pages.bingo_competition.tabs.upcoming.name')}
          </TabsTrigger>
          <TabsTrigger value="completed">
            {t('pages.bingo_competition.tabs.completed.name')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeBingos.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">
                {t('pages.bingo_competition.tabs.completed.error')}
              </h3>
              <p className="text-muted-foreground">{t('pages.bingo_competition.check_back')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:gild-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {activeBingos.map((bingo) => {
                const timeLeft = formatDistance(bingo.expiresAt, now, { includeSeconds: true });

                return (
                  <Card
                    key={bingo.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{bingo.name}</CardTitle>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Badge className={`${difficultyToColour(bingo.difficulty)} text-white`}>
                          {bingo.difficulty.charAt(0).toUpperCase() + bingo.difficulty.slice(1)}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-3-y">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>
                            {bingo.participants} {t('pages.bingo_competition.participants')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{timeLeft}</span>
                        </div>
                      </div>
                      <div className="text-sm mt-1">
                        <div className="flex justify-between mb-1">
                          <span>{t('pages.bingo_competition.progress')}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${bingo.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          {upcomingBingos.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">
                {t('pages.bingo_competition.tabs.upcoming.error')}
              </h3>
              <p className="text-muted-foreground">{t('pages.bingo_competition.check_back')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:gild-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {upcomingBingos.map((bingo) => {
                const timeLeft = formatDistance(bingo.startsAt, now, { includeSeconds: true });

                return (
                  <Card
                    key={bingo.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{bingo.name}</CardTitle>
                        <Badge variant="default">Upcoming</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Badge className={`${difficultyToColour(bingo.difficulty)} text-white`}>
                          {bingo.difficulty.charAt(0).toUpperCase() + bingo.difficulty.slice(1)}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-3-y">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>
                            {bingo.participants} {t('pages.bingo_competition.participants')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>in {timeLeft}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedBingos.length === 0 ? (
            <div className="text-center py-12">
              <Medal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">
                {t('pages.bingo_competition.tabs.completed.error')}
              </h3>
              <p className="text-muted-foreground">{t('pages.bingo_competition.check_back')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:gild-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {completedBingos.map((bingo) => {
                const timeLeft = formatDistance(now, bingo.expiresAt, { includeSeconds: true });

                return (
                  <Card
                    key={bingo.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{bingo.name}</CardTitle>
                        <Badge variant="default">Finished</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Badge className={`${difficultyToColour(bingo.difficulty)} text-white`}>
                          {bingo.difficulty.charAt(0).toUpperCase() + bingo.difficulty.slice(1)}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-3-y">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>
                            {bingo.participants} {t('pages.bingo_competition.participants')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{timeLeft} ago</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
      {createModalOpen && <CreateBingoModal setter={setCreateModalOpen} />}
    </div>
  );
}

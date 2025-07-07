import { LoaderFunctionArgs } from '@remix-run/node';
import { Calendar, Crown, TrendingUp, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import TopSkills from './top-skills';
import TopPlayers from './top-players';
import { act, useState } from 'react';
import {
  getActivePlayersToday,
  getMaxedPlayers,
  getSkillLeaderboard,
  getTopPopularSkills,
  getTotalTrackedPlayers,
  getWeeklyTotalXP,
} from '~/~models/player.server';
import { useLoaderData } from '@remix-run/react';
import { formatBigInt } from '~/lib/utils';
import { SkillMap } from '~/~constants/Skills';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  let timeFilter = url.searchParams.get('time')?.toLowerCase() ?? 'all_time';
  let skillFilter = url.searchParams.get('skill')?.toLowerCase() ?? 'overall';

  const skills = Object.entries(SkillMap).map(([_, name]) => name.toLowerCase());

  if (!['all_time', 'month', 'week', 'today'].includes(timeFilter)) timeFilter = 'all_time';
  if (!['overall', ...skills].includes(skillFilter)) skillFilter = 'overall';

  const [maxedPlayers, totalXP, totalPlayers, activePlayers, popularSkills, leaderboard] =
    await Promise.all([
      getMaxedPlayers(),
      getWeeklyTotalXP(),
      getTotalTrackedPlayers(),
      getActivePlayersToday(),
      getTopPopularSkills(),
      getSkillLeaderboard(skillFilter, timeFilter),
    ]);

  return {
    maxedPlayers,
    totalXP,
    totalPlayers,
    activePlayers,
    popularSkills,
    leaderboards: {
      leaderboard: leaderboard,
      time: timeFilter,
      skill: skillFilter,
    },
  };
}

export default function Leaderboards() {
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  const [timeFilter, setTimeFilter] = useState(data.leaderboards.time);
  const [skillFilter, setSkillFilter] = useState(data.leaderboards.skill);

  const stats = [
    {
      title: t('pages.leaderboards.cards.total_players.title'),
      description: t('pages.leaderboards.cards.total_players.description'),
      value: data.totalPlayers.value,
      icon: Users,
    },
    {
      title: t('pages.leaderboards.cards.maxed_players.title'),
      description: t('pages.leaderboards.cards.maxed_players.description'),
      value: data.maxedPlayers,
      icon: Crown,
    },
    {
      title: t('pages.leaderboards.cards.weekly_xp.title'),
      description: t('pages.leaderboards.cards.weekly_xp.description'),
      value: formatBigInt(data.totalXP),
      icon: TrendingUp,
    },
    {
      title: t('pages.leaderboards.cards.active_today.title'),
      description: t('pages.leaderboards.cards.active_today.description'),
      value: data.activePlayers,
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('pages.leaderboards.title')}</h1>
        <p className="text-muted-foreground">{t('pages.leaderboards.description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            className="transition-smooth hover:shadow-lg animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <TopSkills data={data.popularSkills} />

      <TopPlayers
        filters={{ time: [timeFilter, setTimeFilter], skill: [skillFilter, setSkillFilter] }}
        data={data.leaderboards}
      />
    </div>
  );
}

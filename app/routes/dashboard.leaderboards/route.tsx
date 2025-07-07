import { LoaderFunctionArgs } from '@remix-run/node';
import { Calendar, Crown, TrendingUp, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import TopSkills from './top-skills';
import TopPlayers from './top-players';
import { useState } from 'react';

export async function loader({ request }: LoaderFunctionArgs) {
  return null;
}

export default function Leaderboards() {
  const { t } = useTranslation();

  const [timeFilter, setTimeFilter] = useState('all_time');
  const [skillFilter, setSkillFilter] = useState('overall');

  const stats = [
    {
      title: t('pages.leaderboards.cards.total_players.title'),
      description: t('pages.leaderboards.cards.total_players.description'),
      value: '0',
      icon: Users,
    },
    {
      title: t('pages.leaderboards.cards.maxed_players.title'),
      description: t('pages.leaderboards.cards.maxed_players.description'),
      value: '0',
      icon: Crown,
    },
    {
      title: t('pages.leaderboards.cards.weekly_xp.title'),
      description: t('pages.leaderboards.cards.weekly_xp.description'),
      value: '0',
      icon: TrendingUp,
    },
    {
      title: t('pages.leaderboards.cards.active_today.title'),
      description: t('pages.leaderboards.cards.active_today.description'),
      value: '0',
      icon: Calendar,
    },
  ];

  const sampleData = [
    { skill: 'Necromancy', players: 16 },
    { skill: 'Attack', players: 5 },
    { skill: 'Defence', players: 3 },
    { skill: 'Runecrafting', players: 2 },
    { skill: 'Constitution', players: 1 },
    { skill: 'Crafting', players: 1 },
    { skill: 'Strength', players: 1 },
    { skill: 'Divination', players: 0 },
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

      <TopSkills data={sampleData} />

      <TopPlayers filters={{ time: timeFilter, skill: skillFilter }} data={{}} />
    </div>
  );
}

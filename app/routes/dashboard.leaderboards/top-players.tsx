import { Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

export interface TopPlayersProps {
  data: {};
  filters: {
    time: string;
    skill: string;
  };
}

export default function TopPlayers(props: Readonly<TopPlayersProps>) {
  const { t } = useTranslation();

  return (
    <Card className='animate-fade-in'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Crown className='h-5 w-5 text-primary' />
          {t('pages.leaderboards.top_players.title')} -{' '}
          {t(`pages.leaderboards.top_players.time_filters.${props.filters.time}`)}
        </CardTitle>
        <CardDescription>
          {props.filters.skill === 'overall'
            ? t('pages.leaderboards.top_players.skill_filters.overall')
            : `${props.filters.skill} ${t('pages.leaderboards.top_players.skill_filters.leaderboard')}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        sybau ✌️
      </CardContent>
    </Card>
  );
}

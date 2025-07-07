import { Form, useNavigate, useSearchParams } from '@remix-run/react';
import { Crown } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { formatBigInt } from '~/lib/utils';
import { SkillMap } from '~/~constants/Skills';

export interface TopPlayersProps {
  data: {
    leaderboard: { rank: number; player: string; xp: number; gained: number; level: number }[];
  };
  filters: {
    time: [string, Dispatch<SetStateAction<string>>];
    skill: [string, Dispatch<SetStateAction<string>>];
  };
}

export default function TopPlayers(props: Readonly<TopPlayersProps>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParameters] = useSearchParams();

  const [timeFilter, setTimeFilter] = props.filters.time;
  const [skillFilter, setSkillFilter] = props.filters.skill;

  const handleSkillParameterChange = (value: string) => {
    const params = new URLSearchParams(searchParameters);
    setSkillFilter(value);
    params.set('skill', value);
    navigate(`?${params.toString()}`);
  };

  const handleTimeParameterChange = (value: string) => {
    const params = new URLSearchParams(searchParameters);
    setTimeFilter(value);
    params.set('time', value);
    navigate(`?${params.toString()}`);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          {t('pages.leaderboards.top_players.title')} -{' '}
          {t(`pages.leaderboards.top_players.time_filters.${timeFilter}`)}
        </CardTitle>
        <CardDescription>
          {skillFilter === 'overall'
            ? t('pages.leaderboards.top_players.skill_filters.overall')
            : `${skillFilter.charAt(0).toUpperCase() + skillFilter.slice(1)} ${t('pages.leaderboards.top_players.skill_filters.leaderboard')}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="get" className="flex gap-4 mb-4">
          <Select name="time" value={timeFilter} onValueChange={handleTimeParameterChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_time">
                {t('pages.leaderboards.top_players.time_filters.all_time')}
              </SelectItem>
              <SelectItem value="month">
                {t('pages.leaderboards.top_players.time_filters.month')}
              </SelectItem>
              <SelectItem value="week">
                {t('pages.leaderboards.top_players.time_filters.week')}
              </SelectItem>
              <SelectItem value="today">
                {t('pages.leaderboards.top_players.time_filters.today')}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select name="skill" value={skillFilter} onValueChange={handleSkillParameterChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overall">Overall</SelectItem>
              {Object.entries(SkillMap).map(([_, name]) => (
                <SelectItem value={name.toLowerCase()}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Form>
        <div className="space-y-3">
          {props.data.leaderboard.map((data, idx) => (
            <div
              key={data.rank}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-smooth animate-fade-in cursor-pointer"
              style={{ animationDelay: `${idx * 0.05}s` }}
              onClick={() => navigate(`/dashboard/player/${data.player}`)}
            >
              <div className="flex items-center gap-4">
                <Avatar className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold">
                  <AvatarImage
                    src={`https://secure.runescape.com/m=avatar-rs/${data.player}/chat.png`}
                    alt={`${data.player}'s avatar`}
                  />
                  <AvatarFallback className="w-16 h-16 sm:w-20 sm:h-20 bg-primary text-xl sm:text-2xl font-bold text-primary-foreground">
                    {data.player.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-lg">{data.player}</div>
                  <div className="text-sm text-muted-foreground">Total Level: {data.level}</div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="font-bold text-lg">{formatBigInt(data.xp)} XP</div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    +{formatBigInt(data.gained)} XP
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {t(`pages.leaderboards.top_players.time_filters.${timeFilter}`)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

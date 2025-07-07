import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

export interface TopSkillsProps {
  data: { skill: string; players: number }[];
}

export default function TopSkills({ data }: Readonly<TopSkillsProps>) {
  const { t } = useTranslation();

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          {t('pages.leaderboards.top_skills.title')}
        </CardTitle>
        <CardDescription>{t('pages.leaderboards.top_skills.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="skill" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
            <Bar dataKey="players" fill="#a29bfe" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

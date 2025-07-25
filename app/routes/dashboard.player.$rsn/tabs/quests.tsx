import { CheckCircle, Minus, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Bar, BarChart } from 'recharts';
import { Badge } from '~/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Progress } from '~/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Switch } from '~/components/ui/switch';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from '~/components/ui/table';
import { summarizeQuestsByDifficulty } from '~/lib/client/quests';
import { PlayerData } from '~/~types/PlayerData';
import { DifficultyLabels } from '~/~types/Quest';

export interface QuestTabProps {
  data: {
    player: PlayerData;
    stats: any;
  };
}

export default function QuestsTab(props: Readonly<QuestTabProps>) {
  const { player } = props.data;
  const { t } = useTranslation();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'STARTED':
        return <Minus className="h-4 w-4 text-yellow-500" />;
      case 'NOT_STARTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="default" className="bg-green-500">
            Complete
          </Badge>
        );
      case 'STARTED':
        return (
          <Badge variant="default" className="bg-yellow-500">
            In Progress
          </Badge>
        );
      case 'NOT_STARTED':
        return <Badge variant="secondary">Not Started</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };
  player.Quests.Quests.sort((a, b) => a.Difficulty - b.Difficulty);

  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [eligibleOnly, setEligibleOnly] = useState(false);

  const filteredQuests = useMemo(() => {
    return player.Quests.Quests.filter((quest) => {
      const matchesSearch = quest.Title.toLowerCase().includes(search.toLowerCase());
      const matchesDifficulty = difficultyFilter
        ? DifficultyLabels[quest.Difficulty] === difficultyFilter
        : true;
      const matchesEligibility = eligibleOnly ? quest.Eligible === true : true;
      return matchesSearch && matchesDifficulty && matchesEligibility;
    });
  }, [player.Quests.Quests, search, difficultyFilter, eligibleOnly]);

  const questStats = summarizeQuestsByDifficulty(player.Quests.Quests);

  const colorMap: Record<string, string> = {
    Novice: 'border-green-500 text-green-500',
    Intermediate: 'border-blue-500 text-blue-500',
    Experienced: 'border-purple-500 text-purple-500',
    Master: 'border-orange-500 text-orange-500',
    Grandmaster: 'border-red-500 text-red-500',
    Special: 'border-pink-500 text-pink-500',
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('pages.player_profile.tabs.quests.quest_progress')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={questStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="category" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                />
                <Bar dataKey="total" fill="#374151" />
                <Bar dataKey="completed" fill="#a29bfe" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('pages.player_profile.tabs.quests.quest_statistics')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {questStats.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {t(
                        `pages.player_profile.tabs.quests.quest_types.${category.category.toLowerCase()}`,
                      )}
                    </span>
                    <span>
                      {category.completed}/{category.total}
                    </span>
                  </div>
                  <Progress value={(category.completed / category.total) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('pages.player_profile.tabs.quests.table.title')}</CardTitle>
          <CardDescription>
            {t('pages.player_profile.tabs.quests.table.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-end">
            <Input
              placeholder={t('pages.player_profile.tabs.quests.table.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-1/3"
            />

            <Select onValueChange={(val) => setDifficultyFilter(val === 'All' ? null : val)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Difficulties</SelectItem>
                {Object.values(DifficultyLabels).map((label) => (
                  <SelectItem key={label} value={label}>
                    {t(`pages.player_profile.tabs.quests.quest_types.${label.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Switch checked={eligibleOnly} onCheckedChange={setEligibleOnly} />
              <span>{t(`pages.player_profile.tabs.quests.table.eligible_only`)}</span>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t(`pages.player_profile.tabs.quests.table.headers.quest_name`)}
                </TableHead>
                <TableHead>
                  {t(`pages.player_profile.tabs.quests.table.headers.category`)}
                </TableHead>
                <TableHead className="text-center">
                  {t(`pages.player_profile.tabs.quests.table.headers.quest_points`)}
                </TableHead>
                <TableHead className="text-center">
                  {t(`pages.player_profile.tabs.quests.table.headers.status`)}
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  {t(`pages.player_profile.tabs.quests.table.headers.requirements`)}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuests.map((quest, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(quest.Status)}
                      <a
                        href={`https://runescape.wiki/w/${quest.Title.replace(/\s+/g, '_')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {quest.Title}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={colorMap[DifficultyLabels[quest.Difficulty]]}
                    >
                      {DifficultyLabels[quest.Difficulty]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{quest.QuestPoints}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{getStatusBadge(quest.Status)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {quest.Eligible}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Progress } from '~/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { CheckCircle, XCircle, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Quest {
  name: string;
  category: string;
  questPoints: number;
  status: string;
  requirements: string;
}

interface QuestData {
  category: string;
  completed: number;
  total: number;
}

interface QuestsTabProps {
  questData: QuestData[];
  questsList: Quest[];
}

export function QuestsTab({ questData, questsList }: QuestsTabProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'In Progress':
        return <Minus className="h-4 w-4 text-yellow-500" />;
      case 'Not Started':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Complete':
        return (
          <Badge variant="default" className="bg-green-500">
            Complete
          </Badge>
        );
      case 'In Progress':
        return (
          <Badge variant="default" className="bg-yellow-500">
            In Progress
          </Badge>
        );
      case 'Not Started':
        return <Badge variant="secondary">Not Started</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  questData.sort((a, b) => {
    const order = ['Novice', 'Intermediate', 'Experienced', 'Master', 'Grandmaster', 'Special'];
    return order.indexOf(a.category) - order.indexOf(b.category);
  });

  console.log(questData);

  return (
    <div className="space-y-4 sm:space-y-6">
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
                  <Progress value={(category.completed / category.total) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quests</CardTitle>
          <CardDescription>
            Complete list of quests with quest points and completion status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quest Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Quest Points</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Requirements</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questsList.map((quest, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(quest.status)}
                      <a
                        href={`https://runescape.wiki/w/${quest.name.replace(/\s+/g, '_')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {quest.name}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        quest.category === 'Novice'
                          ? 'border-green-500 text-green-500'
                          : quest.category === 'Intermediate'
                            ? 'border-blue-500 text-blue-500'
                            : quest.category === 'Experienced'
                              ? 'border-purple-500 text-purple-500'
                              : quest.category === 'Master'
                                ? 'border-orange-500 text-orange-500'
                                : 'border-red-500 text-red-500'
                      }
                    >
                      {quest.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{quest.questPoints}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{getStatusBadge(quest.status)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {quest.requirements}
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

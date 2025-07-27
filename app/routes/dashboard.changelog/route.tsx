import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { Calendar, GitCommit } from 'lucide-react';

interface ChangelogEntry {
  version: string;
  title: string;
  date: Date;
  changes: {
    type: 'feature' | 'fix' | 'improvement';
    description: string;
  }[];
}

const changelogData: ChangelogEntry[] = [
  {
    version: 'v0.4.5',
    title: 'Topbar :3',
    date: new Date('2025-07-27T03:16:00Z'),
    changes: [
      { type: 'improvement', description: 'Change favourites to topbar dropdown' },
      { type: 'improvement', description: 'Fixed i18n compatibility' },
      { type: 'improvement', description: 'Fixed padding' },
    ],
  },
  {
    version: 'v0.4.4',
    title: 'Players, again.',
    date: new Date('2025-07-21T19:06:00Z'),
    changes: [
      { type: 'fix', description: 'Add limit of 5 to hall of fame' },
      { type: 'improvement', description: 'Fixed i18n compatibility' },
      { type: 'feature', description: 'Added top players card' },
    ],
  },
  {
    version: 'v0.4.3',
    title: 'API Documentation & Sidebar',
    date: new Date('2025-07-19T15:10:00Z'),
    changes: [
      { type: 'feature', description: 'Added API documentation page' },
      { type: 'feature', description: 'Added footer to sidebar' },
    ],
  },
  {
    version: 'v0.4.2',
    title: 'Charties',
    date: new Date('2025-07-19T13:03:00Z'),
    changes: [
      { type: 'feature', description: 'Add custom Charties component' },
      { type: 'improvement', description: 'Update pie chart on index to Charties' },
    ],
  },
  {
    version: 'v0.4.1',
    title: 'Players rework',
    date: new Date('2025-07-19T00:56:00Z'),
    changes: [
      { type: 'feature', description: 'Add card to Players - "Hall of Fame"' },
      { type: 'feature', description: 'Add card to Players - "Recently Active"' },
    ],
  },
  {
    version: 'v0.4.0',
    title: 'The Changelog update',
    date: new Date('2025-07-19T00:35:00Z'),
    changes: [{ type: 'feature', description: 'Added changelog' }],
  },
];

const getChangeTypeColor = (type: string) => {
  switch (type) {
    case 'feature':
      return 'bg-green-500/10 text-green-700 dark:text-green-400';
    case 'fix':
      return 'bg-red-500/10 text-red-700 dark:text-red-400';
    case 'improvement':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
  }
};

const getChangeTypeLabel = (type: string) => {
  switch (type) {
    case 'feature':
      return 'New';
    case 'fix':
      return 'Fix';
    case 'improvement':
      return 'Improved';
    default:
      return type;
  }
};

export default function Changelog() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Changelog</h1>
        <p className="text-muted-foreground">
          Stay up to date with the latest features, improvements, and fixes.
        </p>
      </div>

      <div className="space-y-6">
        {changelogData.map((entry) => (
          <Card key={entry.version} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold mb-2">
                    {entry.version} - {entry.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(entry.date, 'MMMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                      <GitCommit className="h-4 w-4" />
                      {formatDistanceToNow(entry.date, { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono">
                  {entry.version}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entry.changes.map((change, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge
                      variant="secondary"
                      className={`text-xs px-2 py-1 font-medium ${getChangeTypeColor(change.type)}`}
                    >
                      {getChangeTypeLabel(change.type)}
                    </Badge>
                    <p className="text-sm flex-1 leading-relaxed">{change.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">You've reached the end! 🎉</p>
      </div>
    </div>
  );
}

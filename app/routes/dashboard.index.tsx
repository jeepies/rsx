import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Users, Activity, TrendingUp, Gift, Zap, PieChart, Crown } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Pie,
} from 'recharts';
import { useLoaderData } from '@remix-run/react';

export default function Index() {
  const stats = [
    {
      title: 'Total Players Tracked',
      value: '0',
      icon: Users,
      change: `0%`,
    },
    { title: 'Active Sessions', value: '0', icon: Activity, change: '0%' },
    { title: 'XP Gained Today', value: '0', icon: TrendingUp, change: '0%' },
    { title: 'Drops Today', value: '0', icon: Gift, change: '0%' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Welcome to Nexus
        </h1>
        <p className="text-muted-foreground text-lg">
          Your comprehensive RuneScape 3 tracking and toolkit service
        </p>
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
              <Badge variant="secondary" className="mt-1 text-xs">
                {stat.change} from yesterday
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

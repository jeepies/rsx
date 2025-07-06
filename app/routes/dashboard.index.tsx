import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Users, Activity, TrendingUp, Gift, Zap, Crown } from 'lucide-react';
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
  PieChart,
} from 'recharts';
import { useLoaderData } from '@remix-run/react';
import {
  getTopGainersLast24h,
  getTotalXpGainedByDay,
  getXpBySkillCategoryLast24h,
} from '~/~models/player.server';

export async function loader() {
  const [weeklyDailyXPGain, dailyCategories, topEarners] = await Promise.all([
    getTotalXpGainedByDay(),
    getXpBySkillCategoryLast24h(),
    getTopGainersLast24h(),
  ]);

  return {
    weeklyDailyXPGain,
    dailyCategories,
    topEarners,
  };
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

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

  const COLORS = ['#a29bfe', '#fd79a8', '#00b894', '#fdcb6e'];

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly XP Trends
            </CardTitle>
            <CardDescription>Total XP gained across all tracked players</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.weeklyDailyXPGain}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis
                  stroke="#9CA3AF"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  formatter={(value) => [
                    `${(Number(value) / 1000000).toFixed(1)}M XP`,
                    'XP Gained',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="dailyXP"
                  stroke="#a29bfe"
                  strokeWidth={3}
                  dot={{ fill: '#a29bfe' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Skill Category Distribution
            </CardTitle>
            <CardDescription>Most popular skill categories being trained</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.dailyCategories}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    percent !== undefined ? `${name} (${(percent * 100).toFixed(1)}%)` : name
                  }
                >
                  {data.dailyCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: string) => [
                    value == null ? '0' : value.toLocaleString(),
                    name,
                  ]}
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Top XP Gainers Today
          </CardTitle>
          <CardDescription>Players with the highest XP gains in the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topEarners.map((player, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-smooth"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      player.rank === 1
                        ? 'bg-yellow-500 text-black'
                        : player.rank === 2
                          ? 'bg-gray-400 text-white'
                          : player.rank === 3
                            ? 'bg-amber-600 text-white'
                            : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {player.rank}
                  </div>
                  <div>
                    <div className="font-medium">{player.player}</div>
                    <div className="text-sm text-muted-foreground">Total: {player.xp}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">+{player.gained}</div>
                  <div className="text-xs text-muted-foreground">XP gained</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from '~/components/ui/table';
import { formatBigInt } from '~/lib/utils';
import { PlayerData } from '~/~types/PlayerData';

export interface SkillsTabProps {
  data: {
    player: PlayerData;
    stats: any;
  };
}

export default function SkillTab(props: Readonly<SkillsTabProps>) {
  const { player, stats } = props.data;

  const skills = player.Skills.Skills.sort((a, b) => a.JagexID - b.JagexID).map(s => ({
    ...s,
    today: {
        levels: stats.dailyLevels[s.HumanName],
        xp: stats.dailyXP[s.HumanName]
    }
  }));
  const levelsToday = Object.values(stats.dailyLevels).reduce((a, b) => a + b, 0);
  const xpToday = Object.values(stats.dailyXP).reduce((a, b) => a + b, 0);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{Number(player.Skills.Level)}</div>
              <div className="text-sm text-muted-foreground">Total Level</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{formatBigInt(Number(player.Skills.XP))}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{levelsToday}</div>
              <div className="text-sm text-muted-foreground">Levels Today</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {formatBigInt(Number(xpToday))}
              </div>
              <div className="text-sm text-muted-foreground">XP Today</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            Skill Details
          </CardTitle>
          <CardDescription>Detailed breakdown of all skill levels and experience</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead className="text-right">Level</TableHead>
                <TableHead className="text-right">Virtual</TableHead>
                <TableHead className="text-right">Experience</TableHead>
                <TableHead className="text-right">Levels Today</TableHead>
                <TableHead className="text-right">XP Today</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.map((skill) => (
                <TableRow key={`skill-${skill.JagexID}`}>
                  <TableCell className="font-medium">{skill.HumanName}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{skill.Level > 99 ? 99 : Number(skill.Level)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{Number(skill.Level)}</TableCell>
                  <TableCell className="text-right">{formatBigInt(Number(skill.XP))}</TableCell>
                  <TableCell className="text-right">
                    {skill.today.levels > 0 ? (
                      <Badge variant="default" className="bg-green-500">
                        {skill.today.levels}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {skill.today.xp > 0 ? (
                      <span className="text-green-400 font-medium">+{formatBigInt(Number(skill.today.xp))}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

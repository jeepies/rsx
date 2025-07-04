import { TransformedPlayerData } from "./player.server";
import { ProfileProps } from "~/components/player-profile/profile";

export function transformToPlayerProfileProps(data: TransformedPlayerData): ProfileProps {
  const { account, skills, activities, bosses, collectionLog, ...rest } = data;

  return {
    rsn: account.displayName ?? account.name,
    accountType: account.accountType ?? 'Normal',
    combatLevel: skills.combatLevel,
    totalLevel: skills.totalLevel,
    totalXP: skills.totalXP,
    skills: Object.entries(skills).reduce(
      (acc, [name, value]) => {
        if (typeof value === 'object' && 'level' in value) {
          acc[name] = {
            level: value.level,
            xp: value.xp,
            rank: value.rank,
          };
        }
        return acc;
      },
      {} as PlayerProfileProps['skills'],
    ),
    activities: activities.map((activity) => ({
      name: activity.name,
      score: activity.score,
      rank: activity.rank,
    })),
    bosses: bosses.map((boss) => ({
      name: boss.name,
      kills: boss.kills,
      rank: boss.rank,
      hardmodeKills: boss.hardmodeKills,
    })),
    collectionLog: {
      totalObtained: collectionLog.totalObtained,
      totalItems: collectionLog.totalItems,
    },
  };
}

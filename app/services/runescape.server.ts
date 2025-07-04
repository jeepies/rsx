export interface SkillData {
  level: number;
  xp: number;
  rank: number;
}

export interface RuneMetricsProfile {
  name: string;
  rank: string;
  totalskill: number;
  totalxp: number;
  combatlevel: number;
  magic: number;
  melee: number;
  ranged: number;
  questsstarted: number;
  questscomplete: number;
  questsnotstarted: number;
  activities: any[];
  skillvalues: {
    id: number;
    level: number;
    xp: number;
    rank: number;
  }[];
  loggedIn: string;
}

export interface RuneMetricsProfileFormatted
  extends Omit<RuneMetricsProfile, 'loggedIn' | 'skillvalues'> {
  loggedIn: boolean;
  formattedSkills: Record<string, SkillData>;
}

export interface QuestData {
  title: string;
  status: string;
  difficulty: number;
  members: boolean;
  questPoints: number;
  userEligible: boolean;
}

export class RunescapeAPI {
  private static skillIdToNameMap: Record<number, string> = {
    0: 'Attack',
    1: 'Defence',
    2: 'Strength',
    3: 'Constitution',
    4: 'Ranged',
    5: 'Prayer',
    6: 'Magic',
    7: 'Cooking',
    8: 'Woodcutting',
    9: 'Fletching',
    10: 'Fishing',
    11: 'Firemaking',
    12: 'Crafting',
    13: 'Smithing',
    14: 'Mining',
    15: 'Herblore',
    16: 'Agility',
    17: 'Thieving',
    18: 'Slayer',
    19: 'Farming',
    20: 'Runecrafting',
    21: 'Hunter',
    22: 'Construction',
    23: 'Summoning',
    24: 'Dungeoneering',
    25: 'Divination',
    26: 'Invention',
    27: 'Archaeology',
    28: 'Necromancy',
  };

  static safeParse<T>(data: unknown): T | null {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data) as T;
      } catch {
        return null;
      }
    }
    if (typeof data === 'object' && data !== null) {
      return data as T;
    }
    return null;
  }

  static formatSkills(
    skillvalues: { id: number; level: number; xp: number; rank: number }[],
  ): Record<string, SkillData> {
    const formatted: Record<string, SkillData> = {};
    for (const skill of skillvalues) {
      const skillName = this.skillIdToNameMap[skill.id];
      if (skillName) {
        formatted[skillName] = {
          level: skill.level,
          xp: skill.xp,
          rank: skill.rank,
        };
      }
    }
    return formatted;
  }

  static async fetchRuneMetricsProfile(rsn: string): Promise<RuneMetricsProfileFormatted> {
    const url = `https://apps.runescape.com/runemetrics/profile/profile?user=${encodeURIComponent(
      rsn,
    )}&activities=20`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`RuneMetrics profile fetch failed: ${res.status}`);
    const data = (await res.json()) as RuneMetricsProfile;
    if ((data as any).error) throw new Error(`RuneMetrics profile error: ${(data as any).error}`);

    return {
      ...data,
      loggedIn: data.loggedIn === 'true',
      formattedSkills: this.formatSkills(data.skillvalues),
    };
  }

  static async fetchRuneMetricsQuests(rsn: string): Promise<QuestData[]> {
    const url = `https://apps.runescape.com/runemetrics/quests?user=${encodeURIComponent(rsn)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`RuneMetrics quests fetch failed: ${res.status}`);
    const data = (await res.json()) as QuestData[];
    return data;
  }

  static getChatheadUrl(rsn: string): string {
    return `https://secure.runescape.com/m=avatar-rs/${encodeURIComponent(rsn)}/chat.png`;
  }
}

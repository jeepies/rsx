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

  static async fetchRuneMetricsProfile(
    rsn: string,
  ): Promise<Omit<RuneMetricsProfile, 'loggedIn'> & { loggedIn: boolean }> {
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

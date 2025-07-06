import { SkillMap } from '~/~constants/Skills';
import { PlayerData } from '~/~types/PlayerData';
import { Difficulty, Quest } from '~/~types/Quest';
import { Skill } from '~/~types/Skill';

export class RuneMetrics {
  private static BASE_URL = `https://apps.runescape.com/runemetrics`;

  /**
   * Get a full profile (profile & quests)
   * @param username RuneScape Name
   * @returns
   */
  static async getFullProfile(
    username: string,
  ): Promise<PlayerData | 'PROFILE_PRIVATE' | 'NO_PROFILE'> {
    const [profile, quests] = await Promise.all([
      this.getProfile(username),
      this.getQuests(username),
    ]);

    if (profile.error) return profile.error;

    const mappedSkills: Skill[] = profile.skillvalues.map(
      ({ id, level, xp, rank }: { id: number; level: number; xp: bigint; rank: number }) => {
        const HumanName = SkillMap[id];
        if (!HumanName) {
          throw new Error(`Unknown skill id: ${id}`);
        }

        const removeLastDigit = (num: number | bigint) => Math.floor(Number(num) / 10);

        return {
          JagexID: id,
          HumanName,
          Level: level,
          XP: removeLastDigit(BigInt(xp)),
          Rank: rank,
        };
      },
    );

    const mappedQuests: Quest[] = quests.quests.map(
      ({
        title,
        status,
        difficulty,
        members,
        questPoints,
        userEligible,
      }: {
        title: string;
        status: string;
        difficulty: number;
        members: boolean;
        questPoints: number;
        userEligible: boolean;
      }) => {
        return {
          Title: title,
          Difficulty: difficulty as Difficulty,
          Status: status as 'COMPLETED' | 'STARTED' | 'NOT_STARTED',
          Members: members,
          QuestPoints: questPoints,
          Eligible: userEligible,
        };
      },
    );

    const player: PlayerData = {
      Username: profile.name,
      LoggedIn: profile.loggedIn === 'true',
      Skills: {
        Level: profile.totalskill,
        CombatLevel: profile.combatlevel,
        XP: profile.totalxp,
        Rank: profile.rank,
        Skills: mappedSkills,
      },
      Quests: {
        Completed: profile.questscomplete,
        InProgress: profile.questsstarted,
        NotStarted: profile.questsnotstarted,
        Quests: mappedQuests,
      },
    };

    return player;
  }

  private static async getProfile(username: string): Promise<any> {
    const response = await fetch(this.BASE_URL + `/profile/profile?user=${username}&activities=5`);
    return await response.json();
  }

  private static async getQuests(username: string): Promise<any> {
    const response = await fetch(this.BASE_URL + `/quests?user=${username}`);
    return await response.json();
  }

  static getChatheadURI(username: string): string {
    return `https://secure.runescape.com/m=avatar-rs/${encodeURIComponent(username)}/chat.png`;
  }
}

export class Runescape {
  private static BASE_URL = 'https://secure.runescape.com';

  // TODO: Cache and save clan data to database
  static async getPlayerClanName(username: string) {
    const url =
      this.BASE_URL +
      `/m=website-data/playerDetails.ws?names=%5B%22${encodeURIComponent(username)}%22%5D&callback=jQuery000000000000000_0000000000&_=0`;

    const result = await fetch(url);
    try {
      const clan = JSON.parse(
        (await result.text()).replace('jQuery000000000000000_0000000000(', '').replace(');', ''),
      )[0].clan;
      return clan;
    } catch {
      return 'N/A';
    }
  }
}

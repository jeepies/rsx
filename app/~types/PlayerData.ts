import { Activity } from './Activity';
import { Quest } from './Quest';
import { Skill } from './Skill';

export interface PlayerData {
  /**
   * Username, commonly called RSN
   */
  Username: string;
  /**
   * Online?
   */
  LoggedIn: boolean;
  /**
   *
   */
  Activities: Activity[];
  /**
   * Skills Object
   */
  Skills: {
    /**
     * Total skill level
     */
    Level: bigint | number;
    /**
     * Combat level
     */
    CombatLevel: bigint | number;
    /**
     * Total XP
     */
    XP: bigint | number;
    /**
     * Total rank... as a fucking string..?
     */
    Rank: string;
    /**
     * Array of skills for a user
     */
    Skills: Skill[];
  };

  /**
   * Quests object
   */
  Quests: {
    /**
     * The total amount of completed quests
     */
    Completed: number;
    /**
     * The total amount of in-progress quests
     */
    InProgress: number;
    /**
     * The total amount of unstarted quests
     */
    NotStarted: number;
    /**
     * Array of quests for a user
     */
    Quests: Quest[];
  };
}

export interface CachedPlayerData extends PlayerData {
  /**
   * When the data was added to the cache
   */
  CachedAt: number;
}

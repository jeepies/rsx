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
   * Skills Object
   */
  Skills: {
    /**
     * Total skill level
     */
    Level: number;
    /**
     * Total XP
     */
    XP: bigint;
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

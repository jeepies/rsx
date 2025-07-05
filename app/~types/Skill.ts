export interface Skill {
  /**
   * The ID given to the skill (0 = Attack, 1 = Defence, etc.)
   */
  JagexID: number;
  /**
   * The human name for the skill ('Attack', 'Defence;)
   */
  HumanName: string;
  /**
   * The players level (virtual)
   */
  Level: number;
  /**
   * The players XP
   */
  XP: bigint;
  /**
   * The players rank
   */
  Rank: number;
}

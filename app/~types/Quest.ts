export interface Quest {
  /**
   * Jagex's appointed name
   */
  Title: string;
  /**
   * Difficulty
   */
  Difficulty: Difficulty;
  /**
   * Completion status
   */
  Status: 'COMPLETED' | 'STARTED' | 'NOT_STARTED';
  /**
   * Members only?
   */
  Members: boolean;
  /**
   * Points for completing quest
   */
  QuestPoints: number;
  /**
   * Player eligible?
   */
  Eligible: boolean
}

export enum Difficulty {
  Novice = 0,
  Intermediate = 1,
  Experienced = 2,
  Master = 3,
  Grandmaster = 4,
  Special = 250,
}
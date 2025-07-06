import { PartyPopper } from 'lucide-react';

export interface Activity {
  /**
   * Activity date
   */
  Date: string;
  /**
   * Long description of activity
   */
  Details: string;
  /**
   * Short description of activity
   */
  Text: string;
  /**
   * Locally given unique token
   */
  Token?: string;
  /**
   * Locally given type
   */
  Type?: ActivityType;
}

export enum ActivityType {
  DROP,
  KILL,
  QUEST,
  LEVEL_UP,
  CLAN,
  TREASURE_TRAIL,
}

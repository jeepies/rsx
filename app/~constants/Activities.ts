import { ActivityType } from '~/~types/Activity';

export const KeywordMap: Record<ActivityType, string[]> = {
  [ActivityType.DROP]: ['it dropped', 'I looted a', 'I found a'],
  [ActivityType.KILL]: ['I killed'],
  [ActivityType.QUEST]: [],
  [ActivityType.LEVEL_UP]: ['XP in', 'Levelled up'],
  [ActivityType.CLAN]: ['Capped at my Clan Citadel'],
  [ActivityType.TREASURE_TRAIL]: [
    'Easy treasure trail completed',
    'Medium treasure trail completed',
    'Hard treasure trail completed',
    'Elite treasure trail completed',
    'Master treasure trail completed',
  ],
};

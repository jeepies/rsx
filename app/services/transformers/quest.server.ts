import { QuestData } from '~/services/runescape.server';

export interface TransformedQuestData {
  title: string;
  status: string;
  difficulty: number;
  members: boolean;
  questPoints: number;
  userEligible: boolean;
}

export function transformQuestData(data: QuestData[]): TransformedQuestData[] {
  return data.map((q) => ({
    title: q.title,
    status: q.status,
    difficulty: q.difficulty,
    members: q.members,
    questPoints: q.questPoints,
    userEligible: q.userEligible,
  }));
}

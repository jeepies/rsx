export type RawQuest = {
  status: string;
  id: string;
  snapshotId: string;
  title: string;
  difficulty: number;
  members: boolean;
  questPoints: number;
  userEligible: boolean;
};

interface TranslatedQuest {
  name: string;
  category: string;
  questPoints: number;
  status: string;
  requirements: string;
}

export function questDifficultyToString(difficulty: number): string {
  switch (difficulty) {
    case 0:
      return 'Novice';
    case 1:
      return 'Intermediate';
    case 2:
      return 'Experienced';
    case 3:
      return 'Master';
    case 4:
      return 'Grandmaster';
    case 250:
      return 'Special';
    default:
      return 'Unknown';
  }
}

function normalizeStatus(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'Complete';
    case 'STARTED':
      return 'In Progress';
    case 'NOT_STARTED':
      return 'Not Started';
    default:
      return 'Unknown';
  }
}

export function translateQuests(questsProps: {
  eligibleQuests: RawQuest[];
  completedQuests: RawQuest[];
  allQuests: RawQuest[];
}): TranslatedQuest[] {
  const allQuestsMap = new Map<string, RawQuest>();
  function addQuests(quests: RawQuest[]) {
    for (const q of quests) {
      allQuestsMap.set(q.id, q);
    }
  }
  addQuests(questsProps.allQuests);
  addQuests(questsProps.eligibleQuests);
  addQuests(questsProps.completedQuests);
  return Array.from(allQuestsMap.values()).map((q) => {
    const requirements = q.userEligible ? 'Eligible' : 'Not eligible (requirements not met)';

    return {
      name: q.title,
      category: questDifficultyToString(q.difficulty),
      questPoints: q.questPoints,
      status: normalizeStatus(q.status),
      requirements,
    };
  });
}

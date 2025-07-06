import { DifficultyLabels, Quest } from '~/~types/Quest';

export const summarizeQuestsByDifficulty = (quests: Quest[]) => {
  const summary: Record<string, { category: string; completed: number; total: number }> = {};

  for (const quest of quests) {
    const label = DifficultyLabels[quest.Difficulty] ?? 'Unknown';

    if (!summary[label]) {
      summary[label] = {
        category: label,
        completed: 0,
        total: 0,
      };
    }

    summary[label].total += 1;
    if (quest.Status === 'COMPLETED') {
      summary[label].completed += 1;
    }
  }

  const ordered: string[] = [
    'Novice',
    'Intermediate',
    'Experienced',
    'Master',
    'Grandmaster',
    'Special',
  ];

  return ordered.map((label) => summary[label]).filter(Boolean);
};

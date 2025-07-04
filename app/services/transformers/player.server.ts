import { SkillName } from '@prisma/client';

const skillIdToNameMap: Record<number, SkillName> = {
  0: 'Attack',
  1: 'Defence',
  2: 'Strength',
  3: 'Constitution',
  4: 'Ranged',
  5: 'Prayer',
  6: 'Magic',
  7: 'Cooking',
  8: 'Woodcutting',
  9: 'Fletching',
  10: 'Fishing',
  11: 'Firemaking',
  12: 'Crafting',
  13: 'Smithing',
  14: 'Mining',
  15: 'Herblore',
  16: 'Agility',
  17: 'Thieving',
  18: 'Slayer',
  19: 'Farming',
  20: 'Runecrafting',
  21: 'Hunter',
  22: 'Construction',
  23: 'Summoning',
  24: 'Dungeoneering',
  25: 'Divination',
  26: 'Invention',
  27: 'Archaeology',
};

export interface SkillData {
  level: number;
  xp: bigint;
  rank: number;
}

export interface ActivityData {
  date: Date;
  text: string;
  details: string;
}

export interface RawPlayerData {
  name: string;
  rank: string;
  totalxp: number;
  loggedIn: boolean;
  activities: { date: string; text: string; details: string }[];
  totalskill: number;
  combatlevel: number;
  skillvalues: { id: number; xp: number; rank: number; level: number }[];
}

export interface TransformedPlayerData {
  username: string;
  rank: number;
  totalXp: number;
  totalSkill: number;
  combatLevel: number;
  loggedIn: boolean;
  skills: Record<SkillName, SkillData>;
  activities: ActivityData[];
}

function parseNumber(str: string | number): number {
  if (typeof str === 'number') return str;
  return parseInt(str.replace(/,/g, ''), 10);
}

export function transformPlayerData(raw: RawPlayerData): TransformedPlayerData {
  if (!raw.name) throw new Error('Missing player name');
  if (typeof raw.rank !== 'string') throw new Error('Invalid rank');
  if (!raw.skillvalues || !Array.isArray(raw.skillvalues)) throw new Error('Missing skillvalues');
  if (!raw.activities || !Array.isArray(raw.activities)) throw new Error('Missing activities');

  const rank = parseNumber(raw.rank);
  const totalXp = raw.totalxp ?? 0;
  const totalSkill = raw.totalskill ?? 0;
  const combatLevel = raw.combatlevel ?? 0;
  const loggedIn = !!raw.loggedIn;

  const skills: Record<SkillName, SkillData> = {} as any;

  for (const skill of raw.skillvalues) {
    const skillName = skillIdToNameMap[skill.id];
    if (!skillName) {
      continue;
    }
    const xpWithoutLastDigit = Math.floor(skill.xp / 10);
    skills[skillName] = {
      level: skill.level,
      xp: BigInt(xpWithoutLastDigit),
      rank: skill.rank,
    };
  }

  const activities: ActivityData[] = raw.activities.map(({ date, text, details }) => {
    const parsedDate = new Date(Date.parse(date.replace(/(\d{2})-(\w{3})-(\d{4})/, '$2 $1, $3')));
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid activity date: ${date}`);
    }
    return {
      date: parsedDate,
      text,
      details,
    };
  });


  return {
    username: raw.name,
    rank,
    totalXp,
    totalSkill,
    combatLevel,
    loggedIn,
    skills,
    activities,
  };
}

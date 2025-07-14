import { Drop } from '~/~types/Drop';
import fs from 'fs/promises';
import path from 'path';

export function sanitizeBigInts(obj: any): any {
  if (typeof obj === 'bigint') {
    return obj.toString();
  } else if (Array.isArray(obj)) {
    return obj.map(sanitizeBigInts);
  } else if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeBigInts(obj[key]);
    }
    return sanitized;
  }
  return obj;
}

export function dropInitialSpike(snapshots: { totalXp: bigint; timestamp: Date }[]) {
  if (snapshots.length < 2) return [];

  const firstXp = snapshots[0].totalXp;
  const firstChangeIndex = snapshots.findIndex((s) => s.totalXp !== firstXp);
  return firstChangeIndex === -1 ? [] : snapshots.slice(firstChangeIndex);
}

export async function getDropsWithUrls(): Promise<Drop[]> {
  const jsonPath = path.resolve('./app/~data/drops.json');

  const jsonString = await fs.readFile(jsonPath, 'utf-8');
  const drops: Drop[] = JSON.parse(jsonString);

  const dropsWithUrls = drops.map((drop) => ({
    ...drop,
    image_url: `/images/${drop.image_filename}`,
  }));

  return dropsWithUrls;
}

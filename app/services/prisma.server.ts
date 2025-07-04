import { Prisma, PrismaClient, SkillName } from '@prisma/client';
import { TransformedPlayerData } from './transformers/player.server';

const prismaBase = new PrismaClient();

const extendedClient = prismaBase.$extends({
  model: {
    player: {
      async updateData(data: TransformedPlayerData, where: Prisma.PlayerWhereUniqueInput) {
        const current = await extendedClient.player.findUnique({
          where,
          include: {
            snapshots: {
              orderBy: { timestamp: 'desc' },
              take: 1,
              include: {
                skills: true,
                activities: true,
              },
            },
          },
        });

        if (!current) throw new Error("Player not found. Can't update data.");

        await extendedClient.playerSnapshot.create({
          data: {
            playerId: current.id,
            timestamp: new Date(),

            rank: data.rank,
            totalXp: data.totalXp,
            totalSkill: data.totalSkill,
            combatLevel: data.combatLevel,
            loggedIn: data.loggedIn,

            skills: {
              create: Object.entries(data.skills).map(([name, skill]) => ({
                name: name as SkillName,
                xp: BigInt(skill.xp),
                rank: skill.rank,
                level: skill.level,
              })),
            },

            activities: {
              create: data.activities.map((activity) => ({
                date: new Date(activity.date),
                text: activity.text,
                details: activity.details,
              })),
            },
          },
        });

        return prismaBase.player.update({
          where,
          data: {
            lastFetchedAt: new Date(),
          },
        });
      },
    },
  },
});

type extendedClientType = typeof extendedClient;

if (!global.__prisma) {
  global.__prisma = extendedClient;
}

declare global {
  var __prisma: extendedClientType;
}

global.__prisma.$connect();
export const prisma = global.__prisma;

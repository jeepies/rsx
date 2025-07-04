import { Prisma, PrismaClient } from '@prisma/client';

const prismaBase = new PrismaClient();

const extendedClient = prismaBase.$extends({
  model: {
    player: {
      async updateData(data: Prisma.InputJsonValue, where: { rsn: string }) {
        const currentData = await extendedClient.player.findUnique({ where: where });
        if (!currentData)
          throw new Error("currentData was null. cant update data that doesn't exist");
        const snapshot = await extendedClient.playerSnapshot.create({
          data: {
            playerId: currentData.id,
            timestamp: currentData.lastFetched,
            data: currentData.data as Prisma.InputJsonValue,
          },
        });
        console.log("3")
        if (!snapshot) throw new Error('failed to create snapshot. wont update.');
        return prismaBase.player.update({
          data: {
            data: data,
            lastFetched: new Date(),
          },
          where: where,
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

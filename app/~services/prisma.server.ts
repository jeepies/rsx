import { PrismaClient } from '@prisma/client';

const prismaBase = new PrismaClient();

const extendedClient = prismaBase.$extends({});

type extendedClientType = typeof extendedClient;

if (!global.__prisma) {
  global.__prisma = extendedClient;
}

declare global {
  var __prisma: extendedClientType;
}

global.__prisma.$connect();
export const prisma = global.__prisma;

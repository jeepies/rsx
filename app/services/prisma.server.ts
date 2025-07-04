import { PrismaClient } from '@prisma/client';

const extendedClient = new PrismaClient().$extends({});

type extendedClientType = typeof extendedClient;

if (!global.__prisma) {
  global.__prisma = extendedClient;
}

declare global {
  var __prisma: extendedClientType;
}

global.__prisma.$connect();
export const prisma = global.__prisma;

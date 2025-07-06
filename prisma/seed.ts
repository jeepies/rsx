import { PrismaClient, SkillName } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const username = 'kelcei';

  let player = await prisma.player.findUnique({ where: { username } });
  if (!player) {
    player = await prisma.player.create({
      data: { username },
    });
  }

  async function createSnapshot(date: Date, totalXp: bigint) {
    return prisma.playerSnapshot.create({
      data: {
        playerId: player!.id,
        timestamp: date,
        rank: 12345,
        totalXp,
        totalSkill: 2277n,
        combatLevel: 126n,
        loggedIn: false,
        quests_completed: 40,
        quests_in_progress: 5,
        quests_not_started: 10,
        skills: {
          create: [
            {
              name: SkillName.Attack,
              xp: totalXp / 10n,
              rank: 500n,
              level: 99n,
            },
            {
              name: SkillName.Defence,
              xp: totalXp / 9n,
              rank: 600n,
              level: 99n,
            },
            {
              name: SkillName.Magic,
              xp: totalXp / 8n,
              rank: 550n,
              level: 99n,
            },
          ],
        },
        quests: {
          create: [
            {
              title: 'Dragon Slayer',
              difficulty: 3,
              status: 'COMPLETED',
              members: false,
              questPoints: 2,
              userEligible: true,
            },
            {
              title: 'Recipe for Disaster',
              difficulty: 5,
              status: 'STARTED',
              members: true,
              questPoints: 5,
              userEligible: true,
            },
          ],
        },
      },
    });
  }

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  await createSnapshot(new Date(yesterday.setHours(9, 0, 0, 0)), 1_000_000n);
  await createSnapshot(new Date(yesterday.setHours(15, 0, 0, 0)), 1_500_000n);
  await createSnapshot(new Date(yesterday.setHours(21, 0, 0, 0)), 2_000_000n);

  await createSnapshot(new Date(now.setHours(9, 0, 0, 0)), 2_500_000n);
  await createSnapshot(new Date(now.setHours(15, 0, 0, 0)), 3_200_000n);
  await createSnapshot(new Date(now.setHours(21, 0, 0, 0)), 3_800_000n);

  console.log('Seed data created successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

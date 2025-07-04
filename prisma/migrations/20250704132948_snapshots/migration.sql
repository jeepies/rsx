/*
  Warnings:

  - You are about to drop the column `data` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `lastFetched` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `rsn` on the `Player` table. All the data in the column will be lost.
  - The primary key for the `PlayerSnapshot` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `data` on the `PlayerSnapshot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `Player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `combatLevel` to the `PlayerSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loggedIn` to the `PlayerSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rank` to the `PlayerSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalSkill` to the `PlayerSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalXp` to the `PlayerSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SkillName" AS ENUM ('Attack', 'Defence', 'Strength', 'Constitution', 'Ranged', 'Prayer', 'Magic', 'Cooking', 'Woodcutting', 'Fletching', 'Fishing', 'Firemaking', 'Crafting', 'Smithing', 'Mining', 'Herblore', 'Agility', 'Thieving', 'Slayer', 'Farming', 'Runecrafting', 'Hunter', 'Construction', 'Summoning', 'Dungeoneering', 'Divination', 'Invention', 'Archaeology');

-- DropIndex
DROP INDEX "Player_rsn_key";

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "data",
DROP COLUMN "lastFetched",
DROP COLUMN "rsn",
ADD COLUMN     "lastFetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PlayerSnapshot" DROP CONSTRAINT "PlayerSnapshot_pkey",
DROP COLUMN "data",
ADD COLUMN     "combatLevel" INTEGER NOT NULL,
ADD COLUMN     "loggedIn" BOOLEAN NOT NULL,
ADD COLUMN     "rank" INTEGER NOT NULL,
ADD COLUMN     "totalSkill" INTEGER NOT NULL,
ADD COLUMN     "totalXp" INTEGER NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PlayerSnapshot_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PlayerSnapshot_id_seq";

-- CreateTable
CREATE TABLE "SkillSnapshot" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "name" "SkillName" NOT NULL,
    "xp" BIGINT NOT NULL,
    "rank" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "SkillSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivitySnapshot" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "text" TEXT NOT NULL,
    "details" TEXT NOT NULL,

    CONSTRAINT "ActivitySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_username_key" ON "Player"("username");

-- AddForeignKey
ALTER TABLE "SkillSnapshot" ADD CONSTRAINT "SkillSnapshot_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "PlayerSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySnapshot" ADD CONSTRAINT "ActivitySnapshot_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "PlayerSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

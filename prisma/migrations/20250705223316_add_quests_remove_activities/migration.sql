/*
  Warnings:

  - You are about to drop the `ActivitySnapshot` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `quests_completed` to the `PlayerSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quests_in_progress` to the `PlayerSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quests_not_started` to the `PlayerSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ActivitySnapshot" DROP CONSTRAINT "ActivitySnapshot_snapshotId_fkey";

-- AlterTable
ALTER TABLE "PlayerSnapshot" ADD COLUMN     "quests_completed" INTEGER NOT NULL,
ADD COLUMN     "quests_in_progress" INTEGER NOT NULL,
ADD COLUMN     "quests_not_started" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ActivitySnapshot";

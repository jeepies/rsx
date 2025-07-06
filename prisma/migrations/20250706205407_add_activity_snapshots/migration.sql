-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('DROP', 'KILL', 'QUEST', 'LEVEL_UP');

-- CreateTable
CREATE TABLE "ActivitySnapshot" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "details" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,

    CONSTRAINT "ActivitySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivitySnapshot_token_key" ON "ActivitySnapshot"("token");

-- AddForeignKey
ALTER TABLE "ActivitySnapshot" ADD CONSTRAINT "ActivitySnapshot_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "PlayerSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

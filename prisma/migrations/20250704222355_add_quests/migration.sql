-- CreateTable
CREATE TABLE "QuestSnapshot" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "members" BOOLEAN NOT NULL,
    "questPoints" INTEGER NOT NULL,
    "userEligible" BOOLEAN NOT NULL,

    CONSTRAINT "QuestSnapshot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuestSnapshot" ADD CONSTRAINT "QuestSnapshot_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "PlayerSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

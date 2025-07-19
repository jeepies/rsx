-- CreateTable
CREATE TABLE "XPCompetition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "XPCompetition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "XPCompetitionEntry" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "startXP" BIGINT NOT NULL,
    "endXP" BIGINT,

    CONSTRAINT "XPCompetitionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "XPCompetitionEntry_playerId_competitionId_key" ON "XPCompetitionEntry"("playerId", "competitionId");

-- AddForeignKey
ALTER TABLE "XPCompetitionEntry" ADD CONSTRAINT "XPCompetitionEntry_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XPCompetitionEntry" ADD CONSTRAINT "XPCompetitionEntry_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "XPCompetition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

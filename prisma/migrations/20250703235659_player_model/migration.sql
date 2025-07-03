-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "rsn" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "lastFetched" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_rsn_key" ON "Player"("rsn");

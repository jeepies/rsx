-- CreateTable
CREATE TABLE "PlayerView" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerView_playerId_idx" ON "PlayerView"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerView_playerId_ip_key" ON "PlayerView"("playerId", "ip");

-- AddForeignKey
ALTER TABLE "PlayerView" ADD CONSTRAINT "PlayerView_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

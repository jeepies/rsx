-- DropIndex
DROP INDEX "PlayerView_playerId_idx";

-- DropIndex
DROP INDEX "PlayerView_playerId_ip_key";

-- CreateIndex
CREATE INDEX "PlayerView_playerId_ip_viewedAt_idx" ON "PlayerView"("playerId", "ip", "viewedAt");

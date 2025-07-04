/*
  Warnings:

  - A unique constraint covering the columns `[snapshotId,date,text]` on the table `ActivitySnapshot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ActivitySnapshot_snapshotId_date_text_key" ON "ActivitySnapshot"("snapshotId", "date", "text");

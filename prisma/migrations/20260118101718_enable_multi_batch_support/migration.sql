/*
  Warnings:

  - You are about to drop the column `batchId` on the `Session` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_batchId_fkey";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "batchId";

-- CreateTable
CREATE TABLE "_BatchToSession" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BatchToFaculty" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BatchToSession_AB_unique" ON "_BatchToSession"("A", "B");

-- CreateIndex
CREATE INDEX "_BatchToSession_B_index" ON "_BatchToSession"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BatchToFaculty_AB_unique" ON "_BatchToFaculty"("A", "B");

-- CreateIndex
CREATE INDEX "_BatchToFaculty_B_index" ON "_BatchToFaculty"("B");

-- AddForeignKey
ALTER TABLE "_BatchToSession" ADD CONSTRAINT "_BatchToSession_A_fkey" FOREIGN KEY ("A") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BatchToSession" ADD CONSTRAINT "_BatchToSession_B_fkey" FOREIGN KEY ("B") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BatchToFaculty" ADD CONSTRAINT "_BatchToFaculty_A_fkey" FOREIGN KEY ("A") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BatchToFaculty" ADD CONSTRAINT "_BatchToFaculty_B_fkey" FOREIGN KEY ("B") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

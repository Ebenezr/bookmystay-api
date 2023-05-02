/*
  Warnings:

  - A unique constraint covering the columns `[nationalId]` on the table `Guest` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nationalId` on table `Guest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Guest" ALTER COLUMN "nationalId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Guest_nationalId_key" ON "Guest"("nationalId");

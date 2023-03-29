/*
  Warnings:

  - You are about to drop the column `logourl` on the `Company` table. All the data in the column will be lost.
  - Added the required column `referenceNumber` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "logourl",
ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "referenceNumber" TEXT NOT NULL;

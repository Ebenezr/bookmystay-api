/*
  Warnings:

  - You are about to drop the column `paymentModeId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `referenceNumber` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `PaymentMode` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenceId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_paymentModeId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "paymentModeId",
DROP COLUMN "referenceNumber",
ADD COLUMN     "PaymentMode" TEXT NOT NULL,
ADD COLUMN     "referenceId" TEXT NOT NULL;

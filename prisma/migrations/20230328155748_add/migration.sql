/*
  Warnings:

  - You are about to drop the column `taxname` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `reservationId` on the `Tax` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "paidStatusEnum" AS ENUM ('PAID', 'UNPAID', 'PENDING');

-- DropForeignKey
ALTER TABLE "Tax" DROP CONSTRAINT "Tax_reservationId_fkey";

-- AlterTable
ALTER TABLE "Curency" ADD COLUMN     "symbol" TEXT;

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "taxname",
ADD COLUMN     "paidStatus" "paidStatusEnum" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "taxName" TEXT,
ALTER COLUMN "status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tax" DROP COLUMN "reservationId";

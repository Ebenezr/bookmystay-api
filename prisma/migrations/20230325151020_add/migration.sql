/*
  Warnings:

  - You are about to drop the column `type` on the `Bed` table. All the data in the column will be lost.
  - You are about to drop the column `tax` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `user` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Room` table. All the data in the column will be lost.
  - Added the required column `paymentModeId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `staffId` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Gender" ADD VALUE 'OTHER';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ResavationStatus" ADD VALUE 'CANCELED';
ALTER TYPE "ResavationStatus" ADD VALUE 'UNCONFIRMED';
ALTER TYPE "ResavationStatus" ADD VALUE 'CHECKOUT';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'MANAGER';
ALTER TYPE "Role" ADD VALUE 'OTHER';

-- DropIndex
DROP INDEX "Room_name_idx";

-- AlterTable
ALTER TABLE "Bed" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "paymentModeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "tax",
DROP COLUMN "user",
ADD COLUMN     "staffId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "name",
ADD COLUMN     "floor" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- DropEnum
DROP TYPE "BedType";

-- CreateTable
CREATE TABLE "Tax" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ratio" DECIMAL(65,30) NOT NULL,
    "reservationId" INTEGER,

    CONSTRAINT "Tax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMode" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PaymentMode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curency" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Curency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "regNo" TEXT,
    "logourl" TEXT,
    "entityType" TEXT,
    "website" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Room_code_idx" ON "Room" USING HASH ("code");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tax" ADD CONSTRAINT "Tax_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentModeId_fkey" FOREIGN KEY ("paymentModeId") REFERENCES "PaymentMode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `code` on the `Service` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "code",
ADD COLUMN     "amount" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ServiceType" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);

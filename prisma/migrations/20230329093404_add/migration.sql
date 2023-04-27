/*
  Warnings:

  - You are about to drop the column `rate` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `rate` on the `ServiceType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "rate",
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "ServiceType" DROP COLUMN "rate";

-- CreateTable
CREATE TABLE "ServiceList" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "serviceTypeId" INTEGER NOT NULL,

    CONSTRAINT "ServiceList_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServiceList" ADD CONSTRAINT "ServiceList_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

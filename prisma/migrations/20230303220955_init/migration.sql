/*
  Warnings:

  - You are about to drop the column `dicount` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "dicount",
ADD COLUMN     "discount" DOUBLE PRECISION;

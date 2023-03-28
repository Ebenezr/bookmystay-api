/*
  Warnings:

  - Added the required column `bedType` to the `Bed` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bed" ADD COLUMN     "bedType" TEXT NOT NULL;

/*
  Warnings:

  - You are about to drop the column `sponsered` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "sponsered",
ADD COLUMN     "sponsored" BOOLEAN;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "image",
ADD COLUMN     "image_url" TEXT;

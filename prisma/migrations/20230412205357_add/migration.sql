-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "roomTypeId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

import { PrismaClient } from '@prisma/client';
import { seed } from './seed';

export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  // List your table names here
  const tableNames = [
    'Guest',
    'Room',
    'Amenity',
    'RoomAmenity',
    'RoomType',
    'Bed',
    'Reservation',
    'Tax',
    'Discount',
    'PaymentMode',
    'Curency',
    'Payment',
    'Service',
    'ServiceList',
    'ServiceType',
    'User',
    'Floor',
    'Department',
  ];

  // Delete all data from all tables
  for (const table of tableNames) {
    await prisma.$queryRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }

  // Call the seed function after resetting the database
  await seed(prisma);
}

import { PrismaClient } from '@prisma/client';
import { seed } from './seed';

// full reset
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
    'Service',
  ];

  // Delete all data from all tables
  for (const table of tableNames) {
    await prisma.$queryRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }

  // Call the seed function after resetting the database
  await seed(prisma);
}
// partial reset
export async function partialReset(prisma: PrismaClient): Promise<void> {
  const tableNames = ['Guest', 'Reservation', 'Payment', 'User', 'Service'];
  // Delete all data from all tables
  for (const table of tableNames) {
    await prisma.$queryRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }

  // Call the seed function after resetting the database
  await seed(prisma);
}

// partial reset
export async function reservationsReset(prisma: PrismaClient): Promise<void> {
  const tableNames = ['Reservation', 'Payment', 'Service'];
  // Delete all data from all tables
  for (const table of tableNames) {
    await prisma.$queryRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }

  // Call the seed function after resetting the database
  await seed(prisma);
}

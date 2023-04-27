import { NextFunction, Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, addDays } from 'date-fns';
const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new room
router.post(
  '/rooms',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { RoomAmenity, ...data } = req.body;
      data.maxChild = parseInt(data.maxChild);
      data.maxAdult = parseInt(data.maxAdult);
      data.maxOccupancy = parseInt(data.maxOccupancy);
      data.roomTypeId = parseInt(data.roomTypeId);

      // Convert boolean strings to boolean values
      data.vacant = JSON.parse(data.vacant);
      data.availabilityStatus = JSON.parse(data.availabilityStatus);

      const result = await prisma.room.create({ data });

      // Create RoomAmenity records
      if (Array.isArray(RoomAmenity)) {
        const roomAmenities = await Promise.all(
          RoomAmenity?.map(async (roomAmenity) => {
            // Create RoomAmenity
            return prisma.roomAmenity.create({
              data: {
                roomId: result.id,
                amenityId: roomAmenity.amenityId,
              },
            });
          }),
        );

        // Wait for all RoomAmenity records to be created
        await Promise.all(roomAmenities);
      }

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

// delete a room
router.delete(
  `/room/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const room = await prisma.room.delete({
        where: { id: Number(id) },
      });
      res.status(204).json(room);
    } catch (error) {
      next(error);
    }
  },
);

// update existing room
router.patch(
  '/room/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomId = parseInt(req.params.id);
      const { RoomAmenity, ...data } = req.body;

      if (data.maxChild) data.maxChild = parseInt(data.maxChild);
      if (data.maxAdult) data.maxAdult = parseInt(data.maxAdult);
      if (data.maxOccupancy) data.maxOccupancy = parseInt(data.maxOccupancy);
      if (data.roomTypeId) data.roomTypeId = parseInt(data.roomTypeId);

      if (data.vacant !== undefined) data.vacant = JSON.parse(data.vacant);
      if (data.availabilityStatus !== undefined)
        data.availabilityStatus = JSON.parse(data.availabilityStatus);

      const result = await prisma.room.update({
        where: { id: roomId },
        data: data,
      });

      // Update RoomAmenity records
      if (Array.isArray(RoomAmenity)) {
        // Delete existing RoomAmenity records for the room
        await prisma.roomAmenity.deleteMany({ where: { roomId } });

        // Create new RoomAmenity records
        const roomAmenities = await Promise.all(
          RoomAmenity?.map(async (roomAmenity) => {
            return prisma.roomAmenity.create({
              data: {
                room: {
                  connect: { id: roomId },
                },
                amenity: {
                  connect: { id: roomAmenity.amenityId },
                },
              },
            });
          }),
        );

        // Wait for all RoomAmenity records to be created
        await Promise.all(roomAmenities);
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
);

//  fetch all room
router.get(
  '/rooms',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const rooms = await prisma.room.findMany({
        skip: startIndex,
        take: limit,
        include: {
          Bed: true,
          RoomAmenity: {
            select: {
              amenity: true,
            },
          },
        },
      });

      const totalItems = await prisma.room.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: rooms.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  },
);

//  ffilter rooms
router.get(
  '/rooms/filter',
  async (req: Request, res: Response, next: NextFunction) => {
    const { vacant, availabilityStatus } = req.query;
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const rooms = await prisma.room.findMany({
        skip: startIndex,

        take: limit,
        where: {
          vacant: vacant === 'true' ? true : false,
          availabilityStatus: availabilityStatus === 'true' ? true : false,
        },
        include: {
          Bed: true,
          RoomAmenity: {
            select: {
              amenity: true,
            },
          },
        },
      });

      const totalItems = await prisma.room.count({
        where: {
          vacant: vacant === 'true' ? true : false,
          availabilityStatus: availabilityStatus === 'true' ? true : false,
        },
      });

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: rooms.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  },
);

// fetch single room
router.get(
  '/room/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const room = await prisma.room.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          Bed: true,
          RoomAmenity: {
            select: {
              amenity: true,
            },
          },
        },
      });
      res.status(200).json(room);
    } catch (error) {
      next(error);
    }
  },
);

// fetch all room types no pagination
router.get(
  '/rooms/all',
  async (req: Request, res: Response, next: NextFunction) => {
    const { vacant, availabilityStatus } = req.query;

    try {
      const room = await prisma.room.findMany({
        where: {
          vacant: vacant === 'true' ? true : false,
          availabilityStatus: availabilityStatus === 'true' ? true : false,
        },
        include: {
          Bed: true,
          RoomAmenity: {
            select: {
              amenity: true,
            },
          },
        },
      });
      res.status(200).json({ room });
    } catch (error) {
      next(error);
    }
  },
);

// fetch all room types no pagination
router.get(
  '/rooms/nofilter',
  async (req: Request, res: Response, next: NextFunction) => {
    const { vacant, availabilityStatus } = req.query;

    try {
      const room = await prisma.room.findMany({
        include: {
          Bed: true,
          RoomAmenity: {
            select: {
              amenity: true,
            },
          },
        },
      });
      res.status(200).json({ room });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/rooms/stats',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentDate = new Date();
      const yesterdayDate = addDays(currentDate, -1);

      // Today's stats
      const checkInsToday = await prisma.reservation.count({
        where: {
          checkIn: {
            gte: startOfDay(currentDate),
            lte: endOfDay(currentDate),
          },
        },
      });

      const checkOutsToday = await prisma.reservation.count({
        where: {
          checkOut: {
            gte: startOfDay(currentDate),
            lte: endOfDay(currentDate),
          },
        },
      });

      const todaysReservations = await prisma.reservation.findMany({
        where: {
          checkIn: {
            lte: endOfDay(currentDate),
          },
          checkOut: {
            gte: startOfDay(currentDate),
          },
        },
        select: {
          roomId: true,
        },
      });

      const todaysRoomIds = todaysReservations.map(
        (reservation) => reservation.roomId,
      );

      const occupiedRoomsToday = todaysRoomIds.length;
      const totalRooms = await prisma.room.count();
      const vacantRoomsToday = totalRooms - occupiedRoomsToday;

      // Yesterday's stats
      const checkInsYesterday = await prisma.reservation.count({
        where: {
          checkIn: {
            gte: startOfDay(yesterdayDate),
            lte: endOfDay(yesterdayDate),
          },
        },
      });

      const checkOutsYesterday = await prisma.reservation.count({
        where: {
          checkOut: {
            gte: startOfDay(yesterdayDate),
            lte: endOfDay(yesterdayDate),
          },
        },
      });

      const yesterdayReservations = await prisma.reservation.findMany({
        where: {
          checkIn: {
            lte: endOfDay(yesterdayDate),
          },
          checkOut: {
            gte: startOfDay(yesterdayDate),
          },
        },
        select: {
          roomId: true,
        },
      });

      const yesterdayRoomIds = yesterdayReservations.map(
        (reservation) => reservation.roomId,
      );

      const occupiedRoomsYesterday = yesterdayRoomIds.length;
      const vacantRoomsYesterday = totalRooms - occupiedRoomsYesterday;

      // Calculate percentage change
      const checkInsPercentChange = calculatePercentChange(
        checkInsYesterday,
        checkInsToday,
      );
      const checkOutsPercentChange = calculatePercentChange(
        checkOutsYesterday,
        checkOutsToday,
      );
      const occupiedRoomsPercentChange = calculatePercentChange(
        occupiedRoomsYesterday,
        occupiedRoomsToday,
      );
      const vacantRoomsPercentChange = calculatePercentChange(
        vacantRoomsYesterday,
        vacantRoomsToday,
      );

      res.status(200).json({
        checkInsToday,
        checkOutsToday,
        totalRooms,
        vacantRoomsToday,
        occupiedRoomsToday,
        checkInsYesterday,
        checkOutsYesterday,
        vacantRoomsYesterday,
        occupiedRoomsYesterday,
        checkInsPercentChange,
        checkOutsPercentChange,
        vacantRoomsPercentChange,
        occupiedRoomsPercentChange,
      });
    } catch (error) {
      next(error);
    }
  },
);

function calculatePercentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0 && newValue === 0) {
    return 0;
  }

  const change = newValue - oldValue;
  const percentChange = (change / oldValue) * 100;

  return percentChange;
}

// fetch guests by name
router.get(
  '/searchroom/:code',
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.params;
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const rooms = await prisma.room.findMany({
        where: {
          code: {
            contains: code,
            mode: 'insensitive',
          },
        },
        skip: startIndex,
        take: limit,
      });

      if (!rooms) {
        return res.status(404).json({ error: 'Room not found' });
      }

      const totalItems = await prisma.room.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: rooms.slice(0, endIndex),
      });
    } catch (error: any) {
      next(error);
    }
  },
);

export default router;

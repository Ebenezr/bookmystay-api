import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new room
router.post(
  "/rooms",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      data.maxChild = parseInt(data.maxChild);
      data.maxAdult = parseInt(data.maxAdult);
      data.maxOccupancy = parseInt(data.maxOccupancy);
      data.roomTypeId = parseInt(data.roomTypeId);

      // Convert boolean strings to boolean values
      data.vacant = JSON.parse(data.vacant);
      data.availabilityStatus = JSON.parse(data.availabilityStatus);

      const result = await prisma.room.create({ data });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
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
  }
);

// update room
router.patch(
  "/room/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      const room = await prisma.room.update({
        where: { id: Number(id) },
        data: data,
      });
      res.status(202).json(room);
    } catch (error) {
      next(error);
    }
  }
);

//  fetch all room
router.get(
  "/rooms",
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
  }
);

// fetch single room
router.get(
  "/room/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const room = await prisma.room.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          Bed: true,
        },
      });
      res.status(200).json(room);
    } catch (error) {
      next(error);
    }
  }
);

// fetch all room types no pagination
router.get(
  "/rooms/all",
  async (req: Request, res: Response, next: NextFunction) => {
    const { vacant, availabilityStatus } = req.query;

    try {
      const room = await prisma.room.findMany({
        where: {
          vacant: vacant === "true" ? true : false,
          availabilityStatus: availabilityStatus === "true" ? true : false,
        },
        include: {
          Bed: true,
        },
      });
      res.status(200).json({ room });
    } catch (error) {
      next(error);
    }
  }
);

// fetch all room types no pagination
router.get(
  "/rooms/nofilter",
  async (req: Request, res: Response, next: NextFunction) => {
    const { vacant, availabilityStatus } = req.query;

    try {
      const room = await prisma.room.findMany({
        include: {
          Bed: true,
        },
      });
      res.status(200).json({ room });
    } catch (error) {
      next(error);
    }
  }
);

// fetch guests by name
router.get(
  "/searchroom/:code",
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
            mode: "insensitive",
          },
        },
        skip: startIndex,
        take: limit,
      });

      if (!rooms) {
        return res.status(404).json({ error: "Room not found" });
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
  }
);

export default router;

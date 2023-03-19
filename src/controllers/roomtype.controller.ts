import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new roomtype
router.post(
  "/roomtypes",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await prisma.roomType.create({ data });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// delete a roomtype
router.delete(
  `/roomtype/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const roomType = await prisma.roomType.delete({
        where: { id: Number(id) },
      });
      res.status(204).json(roomType);
    } catch (error) {
      next(error);
    }
  }
);

// update roomtype
router.patch(
  "/roomtype/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      const roomtype = await prisma.roomType.update({
        where: { id: Number(id) },
        data: data,
      });
      res.status(202).json(roomtype);
    } catch (error) {
      next(error);
    }
  }
);

// fetch all roomtype
router.get(
  "/roomtype",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const roomType = await prisma.roomType.findMany({
        skip: startIndex,
        take: limit,
      });

      const totalItems = await prisma.roomType.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: roomType.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  }
);

// fetch single roomtype
router.get(
  "/roomtype/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const roomType = await prisma.roomType.findUnique({
        where: {
          id: Number(id),
        },
      });
      res.status(200).json(roomType);
    } catch (error) {
      next(error);
    }
  }
);

// fetch guests by name
router.get(
  "/searchroomtype/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params;
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const roomTypes = await prisma.roomType.findMany({
        where: {
          name: {
            contains: name,
            mode: "insensitive",
          },
        },
        skip: startIndex,
        take: limit,
      });

      if (!roomTypes) {
        return res.status(404).json({ error: "Guest not found" });
      }

      const totalItems = await prisma.roomType.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: roomTypes.slice(0, endIndex),
      });
    } catch (error: any) {
      if (
        error instanceof prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ error: "Guest not found" });
      }
      next(error);
    }
  }
);

export default router;

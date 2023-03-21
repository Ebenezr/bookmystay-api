import cloudinary from "cloudinary";
import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import multerMiddleware from "../middleware/multer.middleware";

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new room
router.post(
  "/rooms",
  multerMiddleware.single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      if (req.file) {
        const image = await cloudinary.v2.uploader.upload(req.file.path);
        data.image_url = image.secure_url;
      }
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
  multerMiddleware.single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      if (req.file) {
        const image = await cloudinary.v2.uploader.upload(req.file.path);
        data.image_url = image.secure_url;
      }
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

// fetch all room
router.get("/room", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const rooms = await prisma.room.findMany({
      skip: startIndex,
      take: limit,
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
});

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
      });
      res.status(200).json(room);
    } catch (error) {
      next(error);
    }
  }
);

// fetch rooms by name
router.get(
  "/searchroom/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params;
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const rooms = await prisma.room.findMany({
        where: {
          name: {
            contains: name,
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

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
      res.json(result);
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
      res.json(room);
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
      res.json(room);
    } catch (error) {
      next(error);
    }
  }
);

// fetch all room
router.get("/room", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await prisma.room.findMany();
    res.json(room);
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
      res.json(room);
    } catch (error) {
      next(error);
    }
  }
);

// fetch guests by name
router.get(
  "/searchroom/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params;
    try {
      const rooms = await prisma.room.findMany({
        where: {
          name: {
            contains: name,
            mode: "insensitive",
          },
        },
      });

      if (!rooms) {
        return res.status(404).json({ error: "Guest not found" });
      }

      res.json(rooms);
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

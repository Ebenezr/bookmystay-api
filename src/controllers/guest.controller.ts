import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new guest
router.post(
  "/guests",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // check if there is already an guest with the same email address
      const existingGuest = await prisma.guest.findUnique({
        where: { email: req.body.email },
      });
      if (existingGuest) {
        // return an error if the email is already in use
        return res
          .status(400)
          .json({ success: false, error: "Email already in use" });
      }
      const result = await prisma.guest.create({
        data: { ...req.body },
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// delete a guest
router.delete(
  `/guest/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const guest = await prisma.guest.delete({
        where: { id: Number(id) },
      });
      res.status(204).json(guest);
    } catch (error) {
      next(error);
    }
  }
);

// update guests
router.patch(
  "/guest/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const guest = await prisma.guest.update({
        where: { id: Number(id) },
        data: { ...req.body },
      });
      res.status(202).json(guest);
    } catch (error) {
      next(error);
    }
  }
);

// fetch all guests
router.get(
  "/guests",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const guest = await prisma.guest.findMany({
        orderBy: {
          createdAt: "desc",
        },
        skip: startIndex,
        take: limit,
      });

      const totalItems = await prisma.guest.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: guest.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  }
);

// fetch single guest
router.get(
  "/guest/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const guest = await prisma.guest.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!guest) {
        return res.status(404).json({ error: "Guest not found" });
      }

      res.status(200).json(guest);
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

// fetch guests by name
router.get(
  "/searchguest/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params;
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const guests = await prisma.guest.findMany({
        where: {
          name: {
            contains: name,
            mode: "insensitive",
          },
        },
        skip: startIndex,
        take: limit,
      });

      if (!guests) {
        return res.status(404).json({ error: "Guest not found" });
      }

      const totalItems = await prisma.guest.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: guests.slice(0, endIndex),
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

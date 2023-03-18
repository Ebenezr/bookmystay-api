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
        data: { ...req.body},
      });

      res.json(result);
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
      res.json(guest);
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
        data: { ...req.body},
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
      const guest = await prisma.guest.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      res.json(guest);
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

      res.json(guest);
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
      const guests = await prisma.guest.findMany({
        where: {
          name: {
            contains: name,
            mode: "insensitive",
          },
        },
      });

      if (!guests) {
        return res.status(404).json({ error: "Guest not found" });
      }

      res.json(guests);
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

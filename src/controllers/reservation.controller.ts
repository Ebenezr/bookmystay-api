import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new reservation
router.post(
  "/reservations",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // check if there is already an reservation with the same email address
      const existingReservation = await prisma.reservation.findUnique({
        where: { email: req.body.email },
      });
      if (existingReservation) {
        // return an error if the email is already in use
        return res
          .status(400)
          .json({ success: false, error: "Email already in use" });
      }
      const result = await prisma.reservation.create({
        data: { ...req.body },
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// delete a reservation
router.delete(
  `/reservation/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const reservation = await prisma.reservation.delete({
        where: { id: Number(id) },
      });
      res.json(reservation);
    } catch (error) {
      next(error);
    }
  }
);

// update reservations
router.patch(
  "/reservation/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const reservation = await prisma.reservation.update({
        where: { id: Number(id) },
        data: { ...req.body },
      });
      res.status(202).json(reservation);
    } catch (error) {
      next(error);
    }
  }
);

// fetch all reservations
router.get(
  "/reservations",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reservation = await prisma.reservation.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      res.json(reservation);
    } catch (error) {
      next(error);
    }
  }
);

// fetch single reservation
router.get(
  "/reservation/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const reservation = await prisma.reservation.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!reservation) {
        return res.status(404).json({ error: "reservation not found" });
      }

      res.json(reservation);
    } catch (error: any) {
      if (
        error instanceof prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ error: "reservation not found" });
      }
      next(error);
    }
  }
);

// fetch reservations by name
router.get(
  "/searchreservation/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params;
    try {
      const reservations = await prisma.reservation.findMany({
        where: {
          name: {
            contains: name,
            mode: "insensitive",
          },
        },
      });

      if (!reservations) {
        return res.status(404).json({ error: "reservation not found" });
      }

      res.json(reservations);
    } catch (error: any) {
      if (
        error instanceof prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ error: "reservation not found" });
      }
      next(error);
    }
  }
);

export default router;

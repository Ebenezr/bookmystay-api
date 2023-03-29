import { NextFunction, Request, Response, Router } from "express";
import { Payment, PrismaClient, Service } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new reservation
router.post(
  "/reservations",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { services, payments, ...reservationData } = req.body;
      const result = await prisma.reservation.create({
        data: {
          ...reservationData,
          Service: {
            create: services,
          },
          Payment: {
            create: payments,
          },
        },
      });

      // Update the room's vacant field to false
      await prisma.room.update({
        where: { id: req.body.roomId },
        data: { vacant: false },
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
    // const { id } = req.params;
    try {
      const { services, payments, ...reservationData } = req.body;
      const reservation = await prisma.reservation.update({
        where: { id: Number(req.params.id) },
        data: {
          ...reservationData,
          Service: {
            upsert: services.map((service: Service) => ({
              where: { id: service.id },
              update: service,
              create: service,
            })),
          },
          Payment: {
            upsert: payments.map((payment: Payment) => ({
              where: { id: payment.id },
              update: payment,
              create: payment,
            })),
          },
        },
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
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const reservation = await prisma.reservation.findMany({
        orderBy: {
          createdAt: "desc",
        },
        skip: startIndex,
        take: limit,
      });

      const totalItems = await prisma.reservation.count();

      res.json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: reservation.slice(0, endIndex),
      });
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
        include: {
          Service: true,
          Payment: true,
        },
      });

      if (!reservation) {
        return res.status(404).json({ error: "reservation not found" });
      }

      res.json(reservation);
    } catch (error: any) {
      next(error);
    }
  }
);

export default router;

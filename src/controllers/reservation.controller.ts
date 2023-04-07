import { NextFunction, Request, Response, Router } from "express";
import { Payment, PrismaClient, Service } from "@prisma/client";
import { Prisma, Reservation } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new reservation
router.post(
  "/reservations",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { Service, Payment, ...data } = req.body;
      const result = await prisma.reservation.create({
        data: {
          ...data,
          Service: {
            create: Service,
          },
          Payment: {
            create: Payment,
          },
        },
      });

      // Update the room's vacant field based on the reservation status
      if (data.status === "CHECKIN") {
        await prisma.room.update({
          where: { id: req.body.roomId },
          data: { vacant: false },
        });
      } else if (data.status === "CHECKOUT") {
        await prisma.room.update({
          where: { id: req.body.roomId },
          data: { vacant: true },
        });
      }

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
      const { Service = [], Payment = [], ...data } = req.body;

      if (data.adultNumber) data.adultNumber = parseInt(data.adultNumber);
      if (data.childNumber) data.childNumber = parseInt(data.childNumber);
      if (data.roomId) data.roomId = parseInt(data.roomId);
      if (data.guestId) data.guestId = parseInt(data.guestId);
      if (data.staffId) data.staffId = parseInt(data.staffId);
      if (data.roomTotal) data.roomTotal = parseFloat(data.roomTotal);
      if (data.serviceTotal) data.serviceTotal = parseFloat(data.serviceTotal);
      if (data.netTotal) data.netTotal = parseFloat(data.netTotal);
      if (data.taxTotal) data.taxTotal = parseFloat(data.taxTotal);
      if (data.subTotal) data.subTotal = parseFloat(data.subTotal);
      if (data.paid) data.paid = parseFloat(data.paid);
      if (data.balance) data.balance = parseFloat(data.balance);
      if (data.discount) data.discount = parseFloat(data.discount);

      const reservation = await prisma.reservation.update({
        where: { id: parseInt(req.params.id) },
        data: {
          ...data,
          Service: {
            upsert:
              Service?.map((service: Service) => ({
                where: { id: service.id },
                update: service,
                create: service,
              })) || [],
          },
          Payment: {
            upsert:
              Payment?.map((payment: Payment) => ({
                where: { id: payment.id },
                update: payment,
                create: payment,
              })) || [],
          },
        },
      });

      // Update the room's vacant field based on the reservation status
      if (data.status === "CHECKIN") {
        await prisma.room.update({
          where: { id: req.body.roomId },
          data: { vacant: false },
        });
      } else if (data.status === "CHECKOUT") {
        await prisma.room.update({
          where: { id: req.body.roomId },
          data: { vacant: true },
        });
      }
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
        include: {
          Service: true,
          Payment: true,
        },
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

// fetch reservations by guest name
router.get(
  "/searchreservation/:guestname",
  async (req: Request, res: Response, next: NextFunction) => {
    const { guestname } = req.params;
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const reservations = await prisma.reservation.findMany({
        where: {
          Guest: {
            name: {
              contains: guestname,
              mode: "insensitive",
            },
          },
        },
        skip: startIndex,
        take: limit,
        include: {
          Guest: true,
        },
      });

      if (!reservations) {
        return res.status(404).json({ error: "Reservation not found" });
      }

      const totalItems = await prisma.reservation.count({
        where: {
          Guest: {
            name: {
              contains: guestname,
              mode: "insensitive",
            },
          },
        },
      });

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: reservations.slice(0, endIndex),
      });
    } catch (error: any) {
      next(error);
    }
  }
);

// fetch all reservations and revenue
router.get(
  "/reservations/revenue",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const lastThirtyDays = new Date();
      lastThirtyDays.setDate(lastThirtyDays.getDate() - 30);

      const yesterdayRevenue = await prisma.reservation.aggregate({
        where: {
          checkOut: {
            gte: yesterday,
            lt: new Date(),
          },
        },
        _sum: {
          paid: true,
        },
      });

      const lastThirtyDaysRevenue = await prisma.reservation.aggregate({
        where: {
          checkIn: {
            gte: lastThirtyDays,
            lt: new Date(),
          },
        },
        _sum: {
          paid: true,
        },
      });

      res.json({
        yesterdayRevenue: yesterdayRevenue._sum?.paid ?? 0,
        lastThirtyDaysRevenue: lastThirtyDaysRevenue._sum?.paid ?? 0,
      });
    } catch (error: any) {
      next(error);
    }
  }
);

export default router;

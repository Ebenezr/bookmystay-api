import { NextFunction, Request, Response, Router } from "express";
import { Payment, PrismaClient, Service } from "@prisma/client";
import { Prisma, Reservation } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();
import { Decimal } from "decimal.js";

// ROUTES

// create new reservation[Service/Payment]
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

// update reservation [Payment/Service]
router.patch(
  "/reservation/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    // const { id } = req.params;
    try {
      const { Service = [], Payment = [], ...data } = req.body;

      // Parse numeric values
      const numericFields = [
        "adultNumber",
        "childNumber",
        "roomId",
        "guestId",
        "staffId",
        "roomTotal",
        "serviceTotal",
        "netTotal",
        "taxTotal",
        "subTotal",
        "paid",
        "balance",
        "discount",
      ];

      numericFields.forEach((field) => {
        if (data[field]) data[field] = parseFloat(data[field]);
      });
      // const reservationData = {
      //   ...data,
      // };

      // if (Service.length > 0) {
      //   reservationData.Service = {
      //     upsert: Service.map((service: Service) => ({
      //       where: { id: service.id },
      //       update: service,
      //       create: service,
      //     })),
      //   };
      // }

      // // Upsert Payments
      // if (Payment.length > 0) {
      //   reservationData.Payment = {
      //     upsert: Payment.map((payment: Payment) => ({
      //       create: payment,
      //       where: { id: payment.id },
      //       update: {},
      //     })),
      //   };
      // }

      const reservationData = {
        ...data,
        Service: {
          create: Service,
        },
        Payment: {
          create: Payment,
        },
      };

      const reservation = await prisma.reservation.update({
        where: { id: parseInt(req.params.id) },
        data: reservationData,
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

// fetch all reservations[with pagination]
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

// fetch single reservation[Payment/Service]
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

// Search reservations by guest name
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

// fetch all reservations and revenue[Last 30days and Yesterday]
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

//return monthly reservations[object {months:revenue}]
router.get(
  "/reservations/revenue/monthly",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentYear = new Date().getFullYear();
      const monthlyRevenue: Record<string, number> = {};

      for (let month = 0; month < 12; month++) {
        const startDate = new Date(currentYear, month, 1);
        const endDate = new Date(currentYear, month + 1, 1);

        const monthlyRevenueResult = await prisma.reservation.aggregate({
          where: {
            checkOut: {
              gte: startDate,
              lt: endDate,
            },
          },
          _sum: {
            paid: true,
          },
        });

        const monthName = startDate.toLocaleString("default", {
          month: "long",
        });
        const paidAmount = monthlyRevenueResult._sum?.paid;
        monthlyRevenue[monthName] = paidAmount
          ? new Decimal(paidAmount).toNumber()
          : 0;
      }

      res.json(monthlyRevenue);
    } catch (error: any) {
      next(error);
    }
  }
);

//Fetch this week's revenue [object {day:revenue}]

router.get(
  "/reservations/revenue/weekly",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentWeekStart = getStartOfWeek(new Date());
      const dailyRevenue: Record<string, number> = {};

      for (let day = 0; day < 7; day++) {
        const startDate = new Date(currentWeekStart.valueOf());
        startDate.setDate(startDate.getDate() + day);
        const endDate = new Date(startDate.valueOf());
        endDate.setDate(endDate.getDate() + 1);

        const dailyRevenueResult = await prisma.reservation.aggregate({
          where: {
            checkOut: {
              gte: startDate,
              lt: endDate,
            },
          },
          _sum: {
            paid: true,
          },
        });

        const dayName = startDate.toLocaleString("default", {
          weekday: "long",
        });
        const paidAmount = dailyRevenueResult._sum?.paid;
        dailyRevenue[dayName] = paidAmount
          ? new Decimal(paidAmount).toNumber()
          : 0;
      }

      res.json(dailyRevenue);
    } catch (error: any) {
      next(error);
    }
  }
);

router.get(
  "/reservations/staff-sales",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const staffSalesResult = await prisma.reservation.groupBy({
        by: ["staffId"],
        where: {
          checkOut: {
            gte: todayStart,
            lt: todayEnd,
          },
        },
        _sum: {
          paid: true,
        },
      });

      const staffSales: Record<number, number> = {};

      staffSalesResult.forEach((staffSale) => {
        const paidAmount = staffSale._sum.paid;
        staffSales[staffSale.staffId] = paidAmount
          ? new Decimal(paidAmount).toNumber()
          : 0;
      });

      res.json(staffSales);
    } catch (error: any) {
      next(error);
    }
  }
);

router.get(
  "/reservations/revenueByDateRange",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fromDate = req.query.fromDate
        ? new Date(req.query.fromDate as string)
        : undefined;
      const toDate = req.query.toDate
        ? new Date(req.query.toDate as string)
        : undefined;

      if (!fromDate || !toDate) {
        return res.status(400).json({
          error: "Both fromDate and toDate query parameters are required.",
        });
      }

      const dateRangeRevenue = await prisma.reservation.aggregate({
        where: {
          checkOut: {
            gte: fromDate,
            lt: toDate,
          },
        },
        _sum: {
          paid: true,
        },
      });

      res.json({
        dateRangeRevenue: dateRangeRevenue._sum?.paid ?? 0,
      });
    } catch (error: any) {
      next(error);
    }
  }
);

export default router;

function getStartOfWeek(date: Date): Date {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  startOfWeek.setDate(diff);
  return startOfWeek;
}

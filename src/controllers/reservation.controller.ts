import { NextFunction, Request, Response, Router } from 'express';
import {
  Payment,
  PrismaClient,
  Service,
  ResavationStatus,
} from '@prisma/client';
import { Prisma, Reservation } from '@prisma/client';
const prisma = new PrismaClient();
const router = Router();
import { Decimal } from 'decimal.js';

// ROUTES
// create new reservation[Service/Payment]
router.post(
  '/reservations',
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
      if (data.status === 'CHECKIN') {
        await prisma.room.update({
          where: { id: req.body.roomId },
          data: { vacant: false },
        });
      } else if (data.status === 'CHECKOUT') {
        await prisma.room.update({
          where: { id: req.body.roomId },
          data: { vacant: true },
        });
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  },
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
  },
);

// update reservation [Payment/Service]
router.patch(
  '/reservation/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    // const { id } = req.params;
    try {
      const { Service = [], Payment = [], ...data } = req.body;

      // Parse numeric values
      const numericFields = [
        'adultNumber',
        'childNumber',
        'roomId',
        'guestId',
        'staffId',
        'roomTotal',
        'serviceTotal',
        'netTotal',
        'taxTotal',
        'subTotal',
        'paid',
        'balance',
        'discount',
      ];

      numericFields.forEach((field) => {
        if (data[field]) data[field] = parseFloat(data[field]);
      });

      const reservationId = parseInt(req.params.id);

      // Delete current Service and Payment records for the reservation
      await prisma.service.deleteMany({
        where: { reservationId },
      });

      await prisma.payment.deleteMany({
        where: { reservationId },
      });

      // Create new Service and Payment records for the reservation
      const serviceRecords = Service.map((service: Service) => ({
        ...service,
      }));

      const paymentRecords = Payment.map((payment: Payment) => ({
        ...payment,
      }));

      const reservationData = {
        ...data,
        Service: {
          create: serviceRecords,
        },
        Payment: {
          create: paymentRecords,
        },
      };

      const reservation = await prisma.reservation.update({
        where: { id: parseInt(req.params.id) },
        data: reservationData,
      });

      // Update the room's vacant field based on the reservation status
      if (data.status === 'CHECKIN') {
        await prisma.room.update({
          where: { id: req.body.roomId },
          data: { vacant: false },
        });
      } else if (data.status === 'CHECKOUT' || data.status === 'CANCELED') {
        await prisma.room.update({
          where: { id: req.body.roomId },
          data: { vacant: true },
        });
      }
      res.status(202).json(reservation);
    } catch (error) {
      next(error);
    }
  },
);

// fetch all reservations[with pagination]
router.get(
  '/reservations',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const reservation = await prisma.reservation.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          NOT: [
            { status: 'CANCELED' },
            {
              AND: [{ paidStatus: 'PAID' }, { status: 'CHECKOUT' }],
            },
          ],
        },
        skip: startIndex,
        take: limit,
        include: {
          Service: {
            select: {
              type: true,
              amount: true,
              quantity: true,
            },
          },
          Payment: {
            select: {
              PaymentMode: true,
              amount: true,
              referenceId: true,
            },
          },
        },
      });

      const totalItems = await prisma.reservation.count({
        where: {
          NOT: [
            { status: 'CANCELED' },
            {
              AND: [{ paidStatus: 'PAID' }, { status: 'CHECKOUT' }],
            },
          ],
        },
      });

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
  },
);

// fetch all reservations[with pagination]
router.get(
  '/reservations/all',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const reservation = await prisma.reservation.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        skip: startIndex,
        take: limit,
        include: {
          Service: {
            select: {
              type: true,
              amount: true,
              quantity: true,
            },
          },
          Payment: {
            select: {
              PaymentMode: true,
              amount: true,
              referenceId: true,
            },
          },
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
  },
);
// get reservation on a particular date range with pagination
router.get(
  '/reservationsfilter/:from/:to',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to } = req.params;
      const fromDate = new Date(from);
      const toDate = new Date(to);
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        // handle invalid date strings
        return res.status(400).json({ message: 'Invalid date string' });
      }

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const reservation = await prisma.reservation.findMany({
        where: {
          AND: [
            {
              bookTime: {
                gte: new Date(fromDate),
              },
            },
            {
              bookTime: {
                lte: new Date(toDate),
              },
            },
          ],
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: startIndex,
        take: limit,
      });

      const totalItems = await prisma.reservation.count({
        where: {
          AND: [
            {
              bookTime: {
                gte: new Date(fromDate),
              },
            },
            {
              bookTime: {
                lte: new Date(toDate),
              },
            },
          ],
        },
      });

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
  },
);
// url: reservation/2021-01-01/2021-01-31

// fetch single reservation[Payment/Service]
router.get(
  '/reservation/:id',
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
        return res.status(404).json({ error: 'reservation not found' });
      }

      res.json(reservation);
    } catch (error: any) {
      next(error);
    }
  },
);

// Search reservations by guest name
router.get(
  '/searchreservation/:guestname',
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
              contains: guestname.toLowerCase(),
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
        return res.status(404).json({ error: 'Reservation not found' });
      }

      const totalItems = await prisma.reservation.count({
        where: {
          Guest: {
            name: {
              contains: guestname.toLowerCase(),
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
  },
);

// fetch all reservations and revenue[Last 30days and Yesterday]
router.get(
  '/reservations/revenue',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const lastThirtyDays = new Date();
      lastThirtyDays.setDate(lastThirtyDays.getDate() - 30);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayRevenue = await prisma.reservation.aggregate({
        where: {
          checkIn: {
            gte: today,
          },
        },
        _sum: {
          paid: true,
          roomTotal: true,
          serviceTotal: true,
        },
      });

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
        todayRevenue: todayRevenue._sum?.paid ?? 0,
        todayRoomTotal: todayRevenue._sum?.roomTotal ?? 0,
        todayServiceTotal: todayRevenue._sum?.serviceTotal ?? 0,
      });
    } catch (error: any) {
      next(error);
    }
  },
);

//return monthly reservations[object {months:revenue}]
router.get(
  '/reservations/revenue/monthly',
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

        const monthName = startDate.toLocaleString('default', {
          month: 'long',
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
  },
);

//Fetch this week's revenue [object {day:revenue}]
router.get(
  '/reservations/revenue/weekly',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentWeekStart = getStartOfWeek(new Date());
      const weeklyRevenue: Record<string, Record<string, number>> = {
        currentWeek: {},
        previousWeek: {},
      };

      for (let week = 0; week < 2; week++) {
        for (let day = 0; day < 7; day++) {
          const startDate = new Date(currentWeekStart.valueOf());
          startDate.setDate(startDate.getDate() - 7 * week + day);
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

          const dayName = startDate.toLocaleString('default', {
            weekday: 'long',
          });
          const paidAmount = dailyRevenueResult._sum?.paid;
          const revenue = paidAmount ? new Decimal(paidAmount).toNumber() : 0;

          if (week === 0) {
            weeklyRevenue.currentWeek[dayName] = revenue;
          } else {
            weeklyRevenue.previousWeek[dayName] = revenue;
          }
        }
      }

      res.json(weeklyRevenue);
    } catch (error: any) {
      next(error);
    }
  },
);

router.get(
  '/reservations/staff-sales',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const staffSalesResult = await prisma.reservation.groupBy({
        by: ['staffId'],
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
  },
);

router.get(
  '/reservations/revenueByDateRange',
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
          error: 'Both fromDate and toDate query parameters are required.',
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
  },
);

router.get(
  '/reservations/filter',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const status = toResavationStatus(req.query.status as string);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const reservationFilter = status ? { status: { equals: status } } : {};

      const reservation = await prisma.reservation.findMany({
        where: reservationFilter,
        orderBy: {
          createdAt: 'desc',
        },
        skip: startIndex,
        take: limit,
        include: {
          Service: {
            select: {
              type: true,
              amount: true,
              quantity: true,
            },
          },
          Payment: {
            select: {
              PaymentMode: true,
              amount: true,
              referenceId: true,
            },
          },
        },
      });

      const totalItems = await prisma.reservation.count({
        where: reservationFilter,
      });

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
  },
);

// mealplan report
router.get(
  '/meals/:date/:mealType',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date, mealType } = req.params;
      const mealDate = new Date(date);

      if (isNaN(mealDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date string' });
      }

      if (!['breakfast', 'lunch', 'dinner'].includes(mealType.toLowerCase())) {
        return res.status(400).json({ message: 'Invalid meal type' });
      }

      const validMealPlans =
        mealType.toLowerCase() === 'breakfast'
          ? ['Breakfast', 'HalfBoard', 'FullBoard']
          : mealType.toLowerCase() === 'lunch'
          ? ['FullBoard']
          : ['HalfBoard', 'FullBoard'];

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const meals = await prisma.reservation.findMany({
        where: {
          AND: [
            {
              checkIn: {
                lte: mealDate,
              },
            },
            {
              checkOut: {
                gte: mealDate,
              },
            },
            {
              mealPlan: {
                name: {
                  in: validMealPlans,
                },
              },
            },
          ],
        },
        select: {
          code: true,
          Guest: {
            select: {
              id: true,
              name: true,
              phone1: true,
            },
          },
          Room: {
            select: {
              code: true,
            },
          },
          adultNumber: true,
          childNumber: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: startIndex,
        take: limit,
      });

      const totalItems = await prisma.reservation.count({
        where: {
          AND: [
            {
              checkIn: {
                lte: mealDate,
              },
            },
            {
              checkOut: {
                gte: mealDate,
              },
            },
            {
              mealPlan: {
                name: {
                  in: validMealPlans,
                },
              },
            },
          ],
        },
      });

      res.json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: meals.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;

function getStartOfWeek(date: Date): Date {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  startOfWeek.setDate(diff);
  return startOfWeek;
}

function toResavationStatus(value: string): ResavationStatus | undefined {
  return Object.values(ResavationStatus).includes(value as ResavationStatus)
    ? (value as ResavationStatus)
    : undefined;
}

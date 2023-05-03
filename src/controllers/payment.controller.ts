import { NextFunction, Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';
const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new payment
router.post(
  '/payments',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await prisma.payment.create({ data });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

// delete a payment
router.delete(
  `/payment/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const payment = await prisma.payment.delete({
        where: { id: Number(id) },
      });
      res.status(204).json(payment);
    } catch (error) {
      next(error);
    }
  },
);

// update payment
router.patch(
  '/payment/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      const payment = await prisma.payment.update({
        where: { id: Number(id) },
        data: data,
      });
      res.status(202).json(payment);
    } catch (error) {
      next(error);
    }
  },
);

// fetch all payment
router.get(
  '/payments',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const sortByPaymentMode = req.query.sortByPaymentMode as string;
      const sortOrder = req.query.sortOrder as any;

      const orderBy: any | undefined = sortByPaymentMode
        ? { PaymentMode: sortOrder }
        : undefined;

      const payments = await prisma.payment.findMany({
        skip: startIndex,
        take: limit,
        orderBy: orderBy,
      });

      const totalItems = await prisma.payment.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: payments.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/payments/:paymentMode',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paymentMode = req.params.paymentMode as any;
      const sortOrder = req.query.sortOrder as any;

      const orderBy: any | undefined =
        paymentMode && sortOrder ? { PaymentMode: sortOrder } : undefined;

      const payments = await prisma.payment.findMany({
        where: {
          PaymentMode: paymentMode,
        },
        skip: startIndex,
        take: limit,
        orderBy: orderBy,
      });

      const totalItems = await prisma.payment.count({
        where: {
          PaymentMode: paymentMode,
        },
      });

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: payments.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  },
);
// fetch single payment
router.get(
  '/payment/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const payment = await prisma.payment.findUnique({
        where: {
          id: Number(id),
        },
      });
      res.status(200).json(payment);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/paymentsfilter/:from/:to',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to } = req.params;
      const fromDate = new Date(from);
      const toDate = new Date(to);
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const payment = await prisma.payment.findMany({
        where: {
          AND: [
            {
              createdAt: {
                gte: new Date(fromDate),
              },
            },
            {
              createdAt: {
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

      const totalItems = await prisma.payment.count({
        where: {
          AND: [
            {
              createdAt: {
                gte: new Date(fromDate),
              },
            },
            {
              createdAt: {
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
        items: payment.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  },
);

// fetch payments by name
// fetch guests by name
router.get(
  '/searchpayment/:referenceId',
  async (req: Request, res: Response, next: NextFunction) => {
    const { referenceId } = req.params;
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const rooms = await prisma.payment.findMany({
        where: {
          referenceId: {
            contains: referenceId.toLowerCase(),
          },
        },
        skip: startIndex,
        take: limit,
      });

      if (!rooms) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      const totalItems = await prisma.payment.count();

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
  },
);

// Add the new endpoint
router.get(
  '/payments/revenue/payment-modes',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lastThirtyDays = new Date();
      lastThirtyDays.setDate(lastThirtyDays.getDate() - 30);

      const paymentModes = [
        'BANK',
        'MPESA',
        'CHEQUE',
        'CREDIT',
        'CASH',
        'CARD',
      ];

      const revenueByPaymentMode = await Promise.all(
        paymentModes.map(async (mode) => {
          const revenue = await prisma.payment.aggregate({
            where: {
              PaymentMode: mode,
              createdAt: {
                gte: lastThirtyDays,
                lt: new Date(),
              },
            },
            _sum: {
              amount: true,
            },
          });

          return {
            [mode]: revenue._sum?.amount ?? 0,
          };
        }),
      );

      // Merge the individual mode objects into a single object
      const revenueObject = Object.assign({}, ...revenueByPaymentMode);

      res.json({
        lastThirtyDaysRevenueByPaymentMode: revenueObject,
      });
    } catch (error: any) {
      next(error);
    }
  },
);

// todays sales
router.get(
  '/payments/revenue/payment-modes/today',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
      );

      const paymentModes = [
        'BANK',
        'MPESA',
        'CHEQUE',
        'CREDIT',
        'CASH',
        'CARD',
      ];

      const revenueByPaymentMode = await Promise.all(
        paymentModes.map(async (mode) => {
          const revenue = await prisma.payment.aggregate({
            where: {
              PaymentMode: mode,
              createdAt: {
                gte: startOfDay,
                lt: endOfDay,
              },
            },
            _sum: {
              amount: true,
            },
          });

          return {
            [mode]: revenue._sum?.amount ?? 0,
          };
        }),
      );

      // Merge the individual mode objects into a single object
      const revenueObject = Object.assign({}, ...revenueByPaymentMode);

      res.json({
        todayRevenueByPaymentMode: revenueObject,
      });
    } catch (error: any) {
      next(error);
    }
  },
);

export default router;

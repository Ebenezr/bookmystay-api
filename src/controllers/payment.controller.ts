import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new payment
router.post(
  "/payments",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await prisma.payment.create({ data });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
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
  }
);

// update payment
router.patch(
  "/payment/:id",
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
  }
);

//  fetch all payment
router.get(
  "/payments",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payments = await prisma.payment.findMany();

      res.status(200).json(payments);
    } catch (error) {
      next(error);
    }
  }
);

// fetch single payment
router.get(
  "/payment/:id",
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
  }
);

// fetch payments by name
router.get(
  "/searchpayment/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params;
    try {
      const payments = await prisma.payment.findMany();

      if (!payments) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.status(200).json(payments);
    } catch (error: any) {
      next(error);
    }
  }
);

export default router;

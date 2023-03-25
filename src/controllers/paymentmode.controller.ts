import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new paymentmode
router.post(
  "/paymentmodes",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await prisma.paymentMode.create({ data });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// delete a paymentmode
router.delete(
  `/paymentmode/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const paymentmode = await prisma.paymentMode.delete({
        where: { id: Number(id) },
      });
      res.status(204).json(paymentmode);
    } catch (error) {
      next(error);
    }
  }
);

// update paymentmode
router.patch(
  "/paymentmode/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      const paymentmode = await prisma.paymentMode.update({
        where: { id: Number(id) },
        data: data,
      });
      res.status(202).json(paymentmode);
    } catch (error) {
      next(error);
    }
  }
);

//  fetch all paymentmode
router.get(
  "/paymentmodes",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paymentmodes = await prisma.paymentMode.findMany();

      res.status(200).json(paymentmodes);
    } catch (error) {
      next(error);
    }
  }
);

// fetch single paymentmode
router.get(
  "/paymentmode/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const paymentmode = await prisma.paymentMode.findUnique({
        where: {
          id: Number(id),
        },
      });
      res.status(200).json(paymentmode);
    } catch (error) {
      next(error);
    }
  }
);

// fetch paymentmodes by name
router.get(
  "/searchpaymentmode/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params;
    try {
      const paymentmodes = await prisma.paymentMode.findMany({
        where: {
          name: {
            contains: name,
            mode: "insensitive",
          },
        },
      });

      if (!paymentmodes) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.status(200).json(paymentmodes);
    } catch (error: any) {
      next(error);
    }
  }
);

export default router;

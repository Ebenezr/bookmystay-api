import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new currency
router.post(
  "/currencies",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await prisma.currency.create({ data });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// delete a currency
router.delete(
  `/currency/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const currency = await prisma.currency.delete({
        where: { id: Number(id) },
      });
      res.status(204).json(currency);
    } catch (error) {
      next(error);
    }
  }
);

// update currency
router.patch(
  "/currency/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      const currency = await prisma.currency.update({
        where: { id: Number(id) },
        data: data,
      });
      res.status(202).json(currency);
    } catch (error) {
      next(error);
    }
  }
);

//  fetch all currency
router.get(
  "/currencies",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currencies = await prisma.currency.findMany();

      res.status(200).json(currencies);
    } catch (error) {
      next(error);
    }
  }
);

// fetch single currency
router.get(
  "/currency/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const currency = await prisma.currency.findUnique({
        where: {
          id: Number(id),
        },
      });
      res.status(200).json(currency);
    } catch (error) {
      next(error);
    }
  }
);

// fetch currencies by name
router.get(
  "/searchcurrency/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params;
    try {
      const currencies = await prisma.currency.findMany({
        where: {
          name: {
            contains: name,
            mode: "insensitive",
          },
        },
      });

      if (!currencies) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.status(200).json(currencies);
    } catch (error: any) {
      next(error);
    }
  }
);

export default router;

import { NextFunction, Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new curency
router.post(
  '/currencies',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await prisma.curency.create({ data });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

// delete a curency
router.delete(
  `/curency/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const curency = await prisma.curency.delete({
        where: { id: Number(id) },
      });
      res.status(204).json(curency);
    } catch (error) {
      next(error);
    }
  },
);

// update curency
router.patch(
  '/curency/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      const curency = await prisma.curency.update({
        where: { id: Number(id) },
        data: data,
      });
      res.status(202).json(curency);
    } catch (error) {
      next(error);
    }
  },
);

//  fetch all curency
router.get(
  '/currencies',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currencies = await prisma.curency.findMany();

      res.status(200).json(currencies);
    } catch (error) {
      next(error);
    }
  },
);

// fetch single curency
router.get(
  '/curency/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const curency = await prisma.curency.findUnique({
        where: {
          id: Number(id),
        },
      });
      res.status(200).json(curency);
    } catch (error) {
      next(error);
    }
  },
);

// fetch currencies by name
router.get(
  '/searchcurency/:name',
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params;
    try {
      const currencies = await prisma.curency.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
      });

      if (!currencies) {
        return res.status(404).json({ error: 'Room not found' });
      }
      res.status(200).json(currencies);
    } catch (error: any) {
      next(error);
    }
  },
);

export default router;

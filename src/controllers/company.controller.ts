import { NextFunction, Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new company
router.post(
  '/companies',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await prisma.company.create({ data });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

// delete a company
router.delete(
  `/company/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const company = await prisma.company.delete({
        where: { id: Number(id) },
      });
      res.status(204).json(company);
    } catch (error) {
      next(error);
    }
  },
);

// update company
router.patch(
  '/company/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      const company = await prisma.company.update({
        where: { id: Number(id) },
        data: data,
      });
      res.status(202).json(company);
    } catch (error) {
      next(error);
    }
  },
);

//  fetch all company
router.get(
  '/companies',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companies = await prisma.company.findMany();

      res.status(200).json(companies);
    } catch (error) {
      next(error);
    }
  },
);

// fetch single company
router.get(
  '/company/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const company = await prisma.company.findUnique({
        where: {
          id: Number(id),
        },
      });
      res.status(200).json(company);
    } catch (error) {
      next(error);
    }
  },
);

// fetch companies by name
router.get(
  '/searchcompany/:name',
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params;
    try {
      const companies = await prisma.company.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
      });

      if (!companies) {
        return res.status(404).json({ error: 'Room not found' });
      }
      res.status(200).json(companies);
    } catch (error: any) {
      next(error);
    }
  },
);

export default router;

import { NextFunction, Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new mealplan
router.post(
  '/mealplans',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await prisma.mealPlan.create({ data });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

// delete a mealplan
router.delete(
  `/mealplan/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const mealplan = await prisma.mealPlan.delete({
        where: { id: Number(id) },
      });
      res.status(204).json(mealplan);
    } catch (error) {
      next(error);
    }
  },
);

// update mealplan
router.patch(
  '/mealplan/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      const mealplan = await prisma.mealPlan.update({
        where: { id: Number(id) },
        data: data,
      });
      res.status(202).json(mealplan);
    } catch (error) {
      next(error);
    }
  },
);

//  fetch all mealplan
router.get(
  '/mealplans',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const mealplans = await prisma.mealPlan.findMany({
        skip: startIndex,
        take: limit,
      });

      const totalItems = await prisma.mealPlan.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: mealplans.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  },
);

// fetch single mealplan
router.get(
  '/mealplan/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const mealplan = await prisma.mealPlan.findUnique({
        where: {
          id: Number(id),
        },
      });
      res.status(200).json(mealplan);
    } catch (error) {
      next(error);
    }
  },
);

// fetch all mealplan types no pagination
router.get(
  '/mealplans/all',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mealplan = await prisma.mealPlan.findMany();
      res.status(200).json({ mealplan });
    } catch (error) {
      next(error);
    }
  },
);

// fetch guests by name
router.get(
  '/searchmealplan/:name',
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, mealplanType } = req.params;
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const mealplans = await prisma.mealPlan.findMany({
        where: {
          name: {
            contains: name.toLowerCase(),
          },
        },
        skip: startIndex,
        take: limit,
      });

      if (!mealplans) {
        return res.status(404).json({ error: 'Mealplan not found' });
      }

      const totalItems = await prisma.mealPlan.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: mealplans.slice(0, endIndex),
      });
    } catch (error: any) {
      next(error);
    }
  },
);

export default router;

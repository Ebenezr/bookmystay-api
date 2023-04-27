import { NextFunction, Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new bed
router.post(
  '/beds',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await prisma.bed.create({ data });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

// delete a bed
router.delete(
  `/bed/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const bed = await prisma.bed.delete({
        where: { id: Number(id) },
      });
      res.status(204).json(bed);
    } catch (error) {
      next(error);
    }
  },
);

// update bed
router.patch(
  '/bed/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      const bed = await prisma.bed.update({
        where: { id: Number(id) },
        data: data,
      });
      res.status(202).json(bed);
    } catch (error) {
      next(error);
    }
  },
);

//  fetch all bed
router.get('/beds', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const beds = await prisma.bed.findMany({
      skip: startIndex,
      take: limit,
    });

    const totalItems = await prisma.bed.count();

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      itemsPerPage: limit,
      totalItems: totalItems,
      items: beds.slice(0, endIndex),
    });
  } catch (error) {
    next(error);
  }
});

// fetch single bed
router.get(
  '/bed/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const bed = await prisma.bed.findUnique({
        where: {
          id: Number(id),
        },
      });
      res.status(200).json(bed);
    } catch (error) {
      next(error);
    }
  },
);

// fetch all bed types no pagination
router.get(
  '/beds/all',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bed = await prisma.bed.findMany();
      res.status(200).json({ bed });
    } catch (error) {
      next(error);
    }
  },
);

// fetch guests by name
router.get(
  '/searchbed/:name',
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, bedType } = req.params;
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const beds = await prisma.bed.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
        skip: startIndex,
        take: limit,
      });

      if (!beds) {
        return res.status(404).json({ error: 'Bed not found' });
      }

      const totalItems = await prisma.bed.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: beds.slice(0, endIndex),
      });
    } catch (error: any) {
      next(error);
    }
  },
);

export default router;

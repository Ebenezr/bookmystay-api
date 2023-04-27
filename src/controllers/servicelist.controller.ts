import { NextFunction, Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new servicelist
router.post(
  '/servicelists',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await prisma.serviceList.create({ data });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

// delete a servicelist
router.delete(
  `/servicelist/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const servicelist = await prisma.serviceList.delete({
        where: { id: Number(id) },
      });
      res.status(204).json(servicelist);
    } catch (error) {
      next(error);
    }
  },
);

// update servicelist
router.patch(
  '/servicelist/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      const servicelist = await prisma.serviceList.update({
        where: { id: Number(id) },
        data: data,
      });
      res.status(202).json(servicelist);
    } catch (error) {
      next(error);
    }
  },
);

//  fetch all servicelist
router.get(
  '/servicelists',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const servicelists = await prisma.serviceList.findMany({
        skip: startIndex,
        take: limit,
      });

      const totalItems = await prisma.serviceList.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: servicelists.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  },
);

// fetch single servicelist
router.get(
  '/servicelist/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const servicelist = await prisma.serviceList.findUnique({
        where: {
          id: Number(id),
        },
      });
      res.status(200).json(servicelist);
    } catch (error) {
      next(error);
    }
  },
);

// fetch all servicelist types no pagination
router.get(
  '/servicelists/all',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const servicelist = await prisma.serviceList.findMany();
      res.status(200).json({ servicelist });
    } catch (error) {
      next(error);
    }
  },
);

// fetch service by name
router.get(
  '/searchservicelist/:code',
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.params;
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const rooms = await prisma.serviceList.findMany({
        where: {
          name: {
            contains: code,
            mode: 'insensitive',
          },
        },
        skip: startIndex,
        take: limit,
      });

      if (!rooms) {
        return res.status(404).json({ error: 'Service not found' });
      }

      const totalItems = await prisma.serviceList.count();

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

export default router;

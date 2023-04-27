import { NextFunction, Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new amenity
router.post(
  '/amenitys',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await prisma.amenity.create({ data });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

// delete a amenity
router.delete(
  `/amenity/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const amenity = await prisma.amenity.delete({
        where: { id: Number(id) },
      });
      res.status(204).json(amenity);
    } catch (error) {
      next(error);
    }
  },
);

// update amenity
router.patch(
  '/amenity/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      const amenity = await prisma.amenity.update({
        where: { id: Number(id) },
        data: data,
      });
      res.status(202).json(amenity);
    } catch (error) {
      next(error);
    }
  },
);

//  fetch all amenity
router.get(
  '/amenitys',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const amenitys = await prisma.amenity.findMany({
        skip: startIndex,
        take: limit,
      });

      const totalItems = await prisma.amenity.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: amenitys.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  },
);

// fetch single amenity
router.get(
  '/amenity/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const amenity = await prisma.amenity.findUnique({
        where: {
          id: Number(id),
        },
      });
      res.status(200).json(amenity);
    } catch (error) {
      next(error);
    }
  },
);

// fetch all amenity types no pagination
router.get(
  '/amenitys/all',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const amenity = await prisma.amenity.findMany();
      res.status(200).json({ amenity });
    } catch (error) {
      next(error);
    }
  },
);

// fetch guests by name
router.get(
  '/searchamenity/:name',
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, amenityType } = req.params;
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const amenitys = await prisma.amenity.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
        skip: startIndex,
        take: limit,
      });

      if (!amenitys) {
        return res.status(404).json({ error: 'Amenity not found' });
      }

      const totalItems = await prisma.amenity.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: amenitys.slice(0, endIndex),
      });
    } catch (error: any) {
      next(error);
    }
  },
);

export default router;

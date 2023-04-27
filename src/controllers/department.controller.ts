import { NextFunction, Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new department
router.post(
  '/departments',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await prisma.department.create({ data });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

// delete a department
router.delete(
  `/department/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const department = await prisma.department.delete({
        where: { id: Number(id) },
      });
      res.status(204).json(department);
    } catch (error) {
      next(error);
    }
  },
);

// update department
router.patch(
  '/department/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      const department = await prisma.department.update({
        where: { id: Number(id) },
        data: data,
      });
      res.status(202).json(department);
    } catch (error) {
      next(error);
    }
  },
);

// fetch all department paginated
router.get(
  '/departments',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const department = await prisma.department.findMany({
        skip: startIndex,
        take: limit,
      });

      const totalItems = await prisma.department.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: department.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  },
);

// ! fetch all departments no pagination
router.get(
  '/departments/all',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const department = await prisma.department.findMany({});
      res.status(200).json({ department });
    } catch (error) {
      next(error);
    }
  },
);

// fetch single department
router.get(
  '/department/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const department = await prisma.department.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          User: true,
        },
      });
      res.status(200).json(department);
    } catch (error) {
      next(error);
    }
  },
);

// fetch guests by name
router.get(
  '/searchdepartment/:name',
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params;
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const departments = await prisma.department.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
        skip: startIndex,
        take: limit,
      });

      if (!departments) {
        return res.status(404).json({ error: 'Guest not found' });
      }

      const totalItems = await prisma.department.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: departments.slice(0, endIndex),
      });
    } catch (error: any) {
      next(error);
    }
  },
);

export default router;

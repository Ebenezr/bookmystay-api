import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new floor
router.post(
  "/floors",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await prisma.floor.create({ data });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// delete a floor
router.delete(
  `/floor/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const floor = await prisma.floor.delete({
        where: { id: Number(id) },
      });
      res.status(204).json(floor);
    } catch (error) {
      next(error);
    }
  }
);

// update floor
router.patch(
  "/floor/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      const floor = await prisma.floor.update({
        where: { id: Number(id) },
        data: data,
      });
      res.status(202).json(floor);
    } catch (error) {
      next(error);
    }
  }
);

// fetch all floor paginated
router.get(
  "/floors",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const floor = await prisma.floor.findMany({
        skip: startIndex,
        take: limit,
        include: {
          Room: true,
        },
      });

      const totalItems = await prisma.floor.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: floor.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  }
);

//  fetch all floors no pagination
router.get(
  "/floors/all",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const floor = await prisma.floor.findMany({});
      res.status(200).json(floor);
    } catch (error) {
      next(error);
    }
  }
);

// fetch single floor
router.get(
  "/floor/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const floor = await prisma.floor.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          Room: true,
        },
      });
      res.status(200).json(floor);
    } catch (error) {
      next(error);
    }
  }
);

// fetch guests by name
router.get(
  "/searchfloor/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params;
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const floors = await prisma.floor.findMany({
        where: {
          name: {
            contains: name,
            mode: "insensitive",
          },
        },
        include: {
          Room: true,
        },
        skip: startIndex,
        take: limit,
      });

      if (!floors) {
        return res.status(404).json({ error: "Guest not found" });
      }

      const totalItems = await prisma.floor.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: floors.slice(0, endIndex),
      });
    } catch (error: any) {
      next(error);
    }
  }
);

export default router;

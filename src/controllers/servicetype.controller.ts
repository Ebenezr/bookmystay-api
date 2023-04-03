import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new serviceType
router.post(
  "/servicetypes",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await prisma.serviceType.create({ data });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// delete a serviceType
router.delete(
  `/servicetype/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const serviceType = await prisma.serviceType.delete({
        where: { id: Number(id) },
      });
      res.status(204).json(serviceType);
    } catch (error) {
      next(error);
    }
  }
);

// update serviceType
router.patch(
  "/servicetype/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      const serviceType = await prisma.serviceType.update({
        where: { id: Number(id) },
        data: data,
      });
      res.status(202).json(serviceType);
    } catch (error) {
      next(error);
    }
  }
);

//  fetch all serviceType
router.get(
  "/servicetypes",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const serviceTypes = await prisma.serviceType.findMany({
        skip: startIndex,
        take: limit,
        include: {
          ServiceList: true,
        },
      });

      const totalItems = await prisma.serviceType.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: serviceTypes.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  }
);

// fetch single serviceType
router.get(
  "/servicetype/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const serviceType = await prisma.serviceType.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          ServiceList: true,
        },
      });
      res.status(200).json(serviceType);
    } catch (error) {
      next(error);
    }
  }
);

// fetch all serviceType types no pagination
router.get(
  "/servicetypes/all",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serviceType = await prisma.serviceType.findMany({
        include: {
          ServiceList: true,
        },
      });
      res.status(200).json({ serviceType });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/searchservicetype/:code",
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.params;
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const rooms = await prisma.serviceType.findMany({
        where: {
          type: {
            contains: code,
            mode: "insensitive",
          },
        },
        skip: startIndex,
        take: limit,
      });

      if (!rooms) {
        return res.status(404).json({ error: "Service not found" });
      }

      const totalItems = await prisma.serviceType.count();

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
  }
);

export default router;

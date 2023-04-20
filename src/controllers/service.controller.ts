import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new service
router.post(
  "/services",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await prisma.service.create({ data });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// delete a service
router.delete(
  `/service/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const service = await prisma.service.delete({
        where: { id: Number(id) },
      });
      res.status(204).json(service);
    } catch (error) {
      next(error);
    }
  }
);

// update service
router.patch(
  "/service/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      const service = await prisma.service.update({
        where: { id: Number(id) },
        data: data,
      });
      res.status(202).json(service);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/services/:from/:to",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to } = req.params;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const service = await prisma.service.findMany({
        where: {
          AND: [
            {
              createdAt: {
                gte: new Date(from),
              },
            },
            {
              createdAt: {
                lte: new Date(to),
              },
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: startIndex,
        take: limit,
      });

      const totalItems = await prisma.service.count({
        where: {
          AND: [
            {
              createdAt: {
                gte: new Date(from),
              },
            },
            {
              createdAt: {
                lte: new Date(to),
              },
            },
          ],
        },
      });

      res.json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: service.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  }
);

//  fetch all service
router.get(
  "/services",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const services = await prisma.service.findMany({
        skip: startIndex,
        take: limit,
      });

      const totalItems = await prisma.service.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: services.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  }
);

// fetch single service
router.get(
  "/service/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const service = await prisma.service.findUnique({
        where: {
          id: Number(id),
        },
      });
      res.status(200).json(service);
    } catch (error) {
      next(error);
    }
  }
);

// fetch all service types no pagination
router.get(
  "/services/all",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = await prisma.service.findMany();
      res.status(200).json({ service });
    } catch (error) {
      next(error);
    }
  }
);

// fetch guests by name
router.get(
  "/searchservice/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params;
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const rooms = await prisma.service.findMany({
        where: {
          type: {
            contains: name,
            mode: "insensitive",
          },
        },
        skip: startIndex,
        take: limit,
      });

      if (!rooms) {
        return res.status(404).json({ error: "Service not found" });
      }

      const totalItems = await prisma.service.count();

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

import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new discount
router.post(
  "/discountes",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await prisma.discount.create({ data });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// delete a discount
router.delete(
  `/discount/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const discount = await prisma.discount.delete({
        where: { id: Number(id) },
      });
      res.status(204).json(discount);
    } catch (error) {
      next(error);
    }
  }
);

// update discount
router.patch(
  "/discount/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      const discount = await prisma.discount.update({
        where: { id: Number(id) },
        data: data,
      });
      res.status(202).json(discount);
    } catch (error) {
      next(error);
    }
  }
);

//  fetch all discount
router.get(
  "/discountes",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const discountes = await prisma.discount.findMany({
        skip: startIndex,
        take: limit,
      });

      const totalItems = await prisma.discount.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: discountes.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  }
);

// fetch single discount
router.get(
  "/discount/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const discount = await prisma.discount.findUnique({
        where: {
          id: Number(id),
        },
      });
      res.status(200).json(discount);
    } catch (error) {
      next(error);
    }
  }
);

// fetch discountes by name
router.get(
  "/searchdiscount/:code",
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.params;
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const rooms = await prisma.discount.findMany({
        where: {
          name: {
            contains: code,
            mode: "insensitive",
          },
        },
        skip: startIndex,
        take: limit,
      });

      if (!rooms) {
        return res.status(404).json({ error: "Discount not found" });
      }

      const totalItems = await prisma.discount.count();

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

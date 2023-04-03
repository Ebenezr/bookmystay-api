import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new tax
router.post(
  "/taxes",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await prisma.tax.create({ data });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// delete a tax
router.delete(
  `/tax/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const tax = await prisma.tax.delete({
        where: { id: Number(id) },
      });
      res.status(204).json(tax);
    } catch (error) {
      next(error);
    }
  }
);

// update tax
router.patch(
  "/tax/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      const tax = await prisma.tax.update({
        where: { id: Number(id) },
        data: data,
      });
      res.status(202).json(tax);
    } catch (error) {
      next(error);
    }
  }
);

//  fetch all tax
router.get(
  "/taxes",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taxes = await prisma.tax.findMany();

      res.status(200).json(taxes);
    } catch (error) {
      next(error);
    }
  }
);

// fetch single tax
router.get(
  "/tax/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const tax = await prisma.tax.findUnique({
        where: {
          id: Number(id),
        },
      });
      res.status(200).json(tax);
    } catch (error) {
      next(error);
    }
  }
);

// fetch taxes by name
router.get(
  "/searchtax/:code",
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.params;
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const rooms = await prisma.tax.findMany({
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
        return res.status(404).json({ error: "Tax not found" });
      }

      const totalItems = await prisma.tax.count();

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

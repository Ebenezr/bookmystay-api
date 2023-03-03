import cloudinary from "cloudinary";
import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import multerMiddleware from "../middleware/multer.middleware";

const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new category
router.post(
  "/categories",
  multerMiddleware.single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      if (req.file) {
        const image = await cloudinary.v2.uploader.upload(req.file.path);
        data.image_url = image.secure_url;
      }
      const result = await prisma.productCategory.create({ data });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// delete a category
router.delete(
  `/category/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const category = await prisma.productCategory.delete({
        where: { id: Number(id) },
      });
      res.json(category);
    } catch (error) {
      next(error);
    }
  }
);

// update category
router.patch(
  "/category/:id",
  multerMiddleware.single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      if (req.file) {
        const image = await cloudinary.v2.uploader.upload(req.file.path);
        data.image_url = image.secure_url;
      }
      const category = await prisma.productCategory.update({
        where: { id: Number(id) },
        data: data,
      });
      res.json(category);
    } catch (error) {
      next(error);
    }
  }
);

// fetch all category
router.get(
  "/categories",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await prisma.productCategory.findMany({
        include: {
          products: true,
        },
      });
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }
);

// fetch single categories
router.get(
  "/category/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const categories = await prisma.productCategory.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          products: true,
        },
      });
      const products = categories?.products || [];
      res.json(products);
    } catch (error) {
      next(error);
    }
  }
);

export default router;

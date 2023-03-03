import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import multerMiddleware from "../middleware/multer.middleware";
import cloudinary from "cloudinary";
const redis = require("redis");
const cache = require("express-redis-cache")();

// create client with URL
const client = redis.createClient("redis://host.docker.internal:6379");
const prisma = new PrismaClient();
const router = Router();

// ROUTES
// create new product
router.post(
  "/products",
  multerMiddleware.single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      if (req.file) {
        const image = await cloudinary.v2.uploader.upload(req.file.path);
        data.image_url = image.secure_url;
      }
      const product = await prisma.product.create({ data });
      res.json(product);
    } catch (error) {
      next(error);
    }
  }
);

// delete a product
router.delete(
  `/product/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const products = await prisma.product.delete({
        where: { id: Number(id) },
      });
      res.json(products);
    } catch (error) {
      next(error);
    }
  }
);

// update products
router.patch(
  "/product/:id",
  multerMiddleware.single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = req.body;
      if (req.file) {
        const image = await cloudinary.v2.uploader.upload(req.file.path);
        data.image_url = image.secure_url;
      }
      // const product = await prisma.product.create({ data });
      // res.json(product);

      const product = await prisma.product.update({
        where: { id: Number(id) },
        data: data,
      });
      res.json(product);
    } catch (error) {
      next(error);
    }
  }
);

// fetch all products
router.get(
  "/products",
  cache.route(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await prisma.product.findMany();
      res.json(products);
    } catch (error) {
      next(error);
    }
  }
);

// fetch single products
router.get(
  "/product/:id",
  cache.route(),
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const products = await prisma.product.findUnique({
        where: {
          id: Number(id),
        },
      });
      res.json(products);
    } catch (error) {
      next(error);
    }
  }
);

export default router;

import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import multerMiddleware from "../middleware/multer.middleware";
import cloudinary from "cloudinary";

// const redis = require("redis");
// const cache = require("express-redis-cache")();

// create client with URL
// const client = redis.createClient("redis://red-cg427f1mbg5d882tqf4g:6379");

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

      // Convert string values to numbers
      data.price = parseInt(data.price);
      data.rating = parseInt(data.rating);
      data.productCategoryId = parseInt(data.productCategoryId);
      data.discount = parseInt(data.discount);

      // Convert boolean strings to boolean values
      data.sponsored = JSON.parse(data.sponsored);

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

      // Convert string values to numbers
      data.price = parseInt(data.price);
      data.rating = parseInt(data.rating);
      data.productCategoryId = parseInt(data.productCategoryId);
      data.discount = parseInt(data.discount);

      // Convert boolean strings to boolean values
      data.sponsored = JSON.parse(data.sponsored);

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

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const itemsPerPage = parseInt(req.query.limit as string, 20) || 20;

      const startIndex = (page - 1) * itemsPerPage; // Calculate the starting index for the current page
      const endIndex = startIndex + itemsPerPage; // Calculate the ending index for the current page
      const products = await prisma.product.findMany({
        skip: startIndex,
        take: itemsPerPage,
      });

      const totalItems = await prisma.product.count();

      res.json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        itemsPerPage: itemsPerPage,
        totalItems: totalItems,
        items: products.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  }
);

// fetch single products
router.get(
  "/product/:id",

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

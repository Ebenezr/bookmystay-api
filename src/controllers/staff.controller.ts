import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import { AnyZodObject } from "zod";
import { UpdateStaffPayload } from "../types";

// create client with URL

const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();
const router = Router();

const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return res.status(400).json(error);
    }
  };

// ROUTES
// create new user
router.post(
  "/users",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // check if there is already an user with the same email address
      const existingUser = await prisma.user.findUnique({
        where: { email: req.body.email },
      });
      if (existingUser) {
        // return an error if the email is already in use
        return res
          .status(400)
          .json({ success: false, error: "Email already in use" });
      }
      const password = req.body.password;
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await prisma.user.create({
        data: { ...req.body, password: hashedPassword },
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// delete a user
router.delete(
  `/user/:id`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const user = await prisma.user.delete({
        where: { id: Number(id) },
      });
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// update users
router.patch(
  "/user/:id",
  async (
    req: Request<{ id: number }, {}, UpdateStaffPayload>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    try {
      const user = await prisma.user.update({
        where: { id: Number(id) },
        data: { ...req.body },
      });
      res.status(202).json(user);
    } catch (error) {
      next(error);
    }
  }
);

// fetch all users
router.get(
  "/users",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const user = await prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
        skip: startIndex,
        take: limit,
      });

      const totalItems = await prisma.user.count();

      res.json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: user.slice(0, endIndex),
      });
    } catch (error) {
      next(error);
    }
  }
);

// fetch all room types no pagination
router.get(
  "/users/all",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findMany({});
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
);

// fetch single user
router.get(
  "/user/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!user) {
        return res.status(404).json({ error: "user not found" });
      }

      res.json(user);
    } catch (error: any) {
      next(error);
    }
  }
);

// fetch users by name
router.get(
  "/searchuser/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params;
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const users = await prisma.user.findMany({
        where: {
          name: {
            contains: name,
            mode: "insensitive",
          },
        },
        skip: startIndex,
        take: limit,
      });

      if (!users) {
        return res.status(404).json({ error: "user not found" });
      }

      const totalItems = await prisma.user.count();

      res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
        totalItems: totalItems,
        items: users.slice(0, endIndex),
      });
    } catch (error: any) {
      next(error);
    }
  }
);

export default router;

import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import { AnyZodObject } from "zod";
import { createUserSchema } from "../schemas/user.schema";


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
  validate(createUserSchema),
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
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const password = req.body.password;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.update({
        where: { id: Number(id) },
        data: { ...req.body, password: hashedPassword },
      });
      res.json(user);
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
      const user = await prisma.user.findMany();
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// fetch single users
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

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

export default router;

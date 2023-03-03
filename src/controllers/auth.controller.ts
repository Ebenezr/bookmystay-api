import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import { AnyZodObject } from "zod";
import { createUserSchema, loginUserSchema } from "../schemas/user.schema";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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

router.post(
  "/login",

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // query the appropriate table based on the user's role

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // return an error if
        return res
          .status(400)
          .json({ success: false, error: "Invalid email or password" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid email or password" });
        // throw new Error("Invalid email or password");
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        token,
        name: user.name,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

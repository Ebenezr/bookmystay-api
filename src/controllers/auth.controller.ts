import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();
const router = Router();

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

// Add a new route to handle password reset requests
router.post(
  "/reset-password",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid email address" });
      }

      // Generate a password reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const passwordResetExpires = new Date(Date.now() + 3600000); // Token valid for 1 hour

      // Update the user with the reset token and expiration
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires,
        },
      });

      // Send the reset token via email (replace with your email sending logic)
      // ...

      res.json({
        success: true,
        message:
          "Password reset token sent. Check your email for further instructions.",
      });
    } catch (error) {
      next(error);
    }
  }
);

// Add a new route to handle the actual password reset
router.post(
  "/reset-password/:token",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      // Find the user with the provided token and check if it's still valid
      const user = await prisma.user.findUnique({
        where: { passwordResetToken: token },
      });

      if (
        !user ||
        user.passwordResetExpires === null ||
        user.passwordResetExpires < new Date()
      ) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid or expired token" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user with the new password and clear the reset token and expiration
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });

      res.json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

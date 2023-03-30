import { NextFunction, Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { serialize } from "cookie";
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

      // Check if user is active
      if (!user.activeStatus) {
        return res
          .status(400)
          .json({ success: false, error: "User account is inactive" });
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
        { expiresIn: "12h" }
      );

      // Set the session cookie
      const sessionCookie = serialize("session", token, {
        httpOnly: true,
        sameSite: "none",
        maxAge: 12 * 60 * 60, // 12 hours in seconds
        path: "/",
      });

      // Add the session cookie to the response header
      res.setHeader("Set-Cookie", sessionCookie);

      res.json({
        success: true,
        token,
        name: user.name,
        role: user.role,
        email: user.email,
        userId: user.id,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Add a new route to handle email verification and token generation
router.post(
  "/verify-email",
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
      const passwordResetExpires = new Date(Date.now() + 600000); // Token valid for 10 minutes

      // Update the user with the reset token and expiration
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires,
        },
      });

      res.json({
        success: true,
        message: "Email verified successfully. Token generated.",
        token: resetToken,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Add a new route to handle the actual password reset
router.post(
  "/reset-password",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;

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

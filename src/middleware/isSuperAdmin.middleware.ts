// isSuperAdmin.ts
import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function isSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId; // Assuming you have a userId field in the request object
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.superuser) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

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
    const userId = req.query.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user || !user.superuser) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

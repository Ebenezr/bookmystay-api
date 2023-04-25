import { NextFunction, Request, Response, Router } from "express";
import { exec } from "child_process";
import { parse } from "pg-connection-string";
import { config as loadEnvConfig } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { resetDatabase } from "../reset";

const prisma = new PrismaClient();
const router = Router();

// Backup Database
router.post(
  "/backup",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const connectionString = process.env.DATABASE_URL || "";
      const connectionParams = parse(connectionString);
      const filePath = "./backup.sql";

      const backupCmd = `pg_dump -U ${connectionParams.user} -h ${connectionParams.host} -p ${connectionParams.port} -d ${connectionParams.database} -f ${filePath}`;

      exec(backupCmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          res.status(500).send("Error backing up the database");
          return;
        }
        res.status(200).send("Database backup completed");
      });
    } catch (error) {
      next(error);
    }
  }
);

// Restore Database
router.post(
  "/restore",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const connectionString = process.env.DATABASE_URL || "";
      const connectionParams = parse(connectionString);
      const filePath = req.body.filePath;

      const restoreCmd = `pg_restore -U ${connectionParams.user} -h ${connectionParams.host} -p ${connectionParams.port} -d ${connectionParams.database} -c ${filePath}`;

      exec(restoreCmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          res.status(500).send("Error restoring the database");
          return;
        }
        res.status(200).send("Database restore completed");
      });
    } catch (error) {
      next(error);
    }
  }
);

// Secure this endpoint by adding authentication middleware
router.post("/reset-database", async (req, res) => {
  try {
    await resetDatabase(prisma);
    res.status(200).json({ message: "Database reset successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset database", details: error });
  }
});

// Export the router
export default router;

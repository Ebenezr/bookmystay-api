import { NextFunction, Request, Response, Router } from "express";
import { exec } from "child_process";
import { parse } from "pg-connection-string";
import { config as loadEnvConfig } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { resetDatabase } from "../reset";
import { isSuperAdmin } from "../middleware/isSuperAdmin.middleware";
import Docker from "dockerode";
const docker = new Docker({ socketPath: "/var/run/docker.sock" });
const prisma = new PrismaClient();
const router = Router();

import { Stream } from "stream";

// Backup Database
router.post(
  "/backup",
  isSuperAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const connectionString = process.env.DATABASE_URL || "";
      const connectionParams = parse(connectionString);

      // The container name or ID of Postgres container
      const postgresContainerName = "/bookmystay-api-db";

      // Find the Postgres container
      const containers = await docker.listContainers();
      const postgresContainerInfo = containers.find(
        (container) =>
          container.Names && container.Names.includes(postgresContainerName)
      );

      if (!postgresContainerInfo) {
        console.log("Postgres container not found");
        res.status(500).send("Postgres container not found");
        return;
      }

      // Create an exec instance with the pg_dump command
      const execOptions = {
        Cmd: [
          "pg_dump",
          "-U",
          String(connectionParams.user),
          "-h",
          String(connectionParams.host),
          "-p",
          String(connectionParams.port),
          "-d",
          String(connectionParams.database),
        ],
      };

      console.log(execOptions.Cmd.join(" "));

      const exec = await docker
        .getContainer(postgresContainerInfo.Id)
        .exec(execOptions);

      // Run the exec instance and capture the output as a stream
      const stream = await exec.start({ Tty: false });

      console.log("Backup stream started");

      if (stream) {
        console.log("Backup stream has data");

        // Set the response headers to indicate that this is a download
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader("Content-Disposition", "attachment; filename=backup.sql");

        // Add a listener to the stream's data event to write the data to the response
        stream.on("data", (chunk) => {
          console.log("Stream data received:", chunk.toString("utf8"));
          console.log("Stream data length:", chunk.length);
          res.write(chunk.toString("utf8"));
        });

        // Add a listener to the stream's end event to end the response
        stream.on("end", () => {
          console.log("Stream ended");
          res.end();
        });

        // Add a listener to the stream's error event to log any errors that occur
        stream.on("error", (error) => {
          console.error("Stream error:", error);
        });
      } else {
        console.log("Backup stream is empty");
        res.status(500).send("Error backing up the database");
      }
      console.log("Database backup completed");
    } catch (error) {
      next(error);
    }
  }
);
// Restore Database
router.post(
  "/restore",
  isSuperAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const connectionString = process.env.DATABASE_URL || "";
      const connectionParams = parse(connectionString);
      const filePath = req.body.filePath;

      // Replace this with the container name or ID of your Postgres container
      const postgresContainerName = "/bookmystay-api-db";

      // Find the Postgres container
      const containers = await docker.listContainers();
      const postgresContainerInfo = containers.find(
        (container) =>
          container.Names && container.Names.includes(postgresContainerName)
      );

      if (!postgresContainerInfo) {
        res.status(500).send("Postgres container not found");
        return;
      }

      // Create an exec instance with the pg_restore command
      const postgresContainer = docker.getContainer(postgresContainerInfo.Id);
      const execOptions = {
        Cmd: [
          "pg_restore",
          "-U",
          connectionParams.user,
          "-h",
          connectionParams.host,
          "-p",
          connectionParams.port,
          "-d",
          connectionParams.database,
          "-c",
          filePath,
        ],
        AttachStdout: true,
        AttachStderr: true,
      };

      const exec = await postgresContainer.exec(execOptions);

      // Run the exec instance and capture the output
      exec.start({}, (error, stream) => {
        if (error) {
          console.error(`exec error: ${error}`);
          res.status(500).send("Error restoring the database");
          return;
        }

        if (stream instanceof Stream) {
          // Log the output for debugging purposes
          docker.modem.demuxStream(stream, process.stdout, process.stderr);

          // Close the stream and send a response when the restore is complete
          stream.on("end", () => {
            res.status(200).send("Database restore completed");
          });
        } else {
          res.status(500).send("Error: Invalid stream");
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Secure this endpoint by adding authentication middleware
router.post("/reset-database", isSuperAdmin, async (req, res) => {
  try {
    await resetDatabase(prisma);
    res.status(200).json({ message: "Database reset successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset database", details: error });
  }
});

// Export the router
export default router;

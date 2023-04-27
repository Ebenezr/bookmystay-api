export interface UpdateGuestPayload {
  id?: number;
  name: string;
  phone1: string;
  phone2: string;
  email: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  nationality: string;
  imgUrl?: string | null;
}

export interface UpdateStaffPayload {
  id?: number;
  name: string;
  role: 'ADMIN' | 'USER';
  email: string;
  password?: string;
  phone: string;
  departmentId: number;
  activeStatus: boolean;
}

// router.post(
//   "/restore",
//   isSuperAdmin,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const connectionString = process.env.DATABASE_URL || "";
//       const connectionParams = parse(connectionString);
//       const filePath = req.body.filePath;

//       const restoreCmd = `docker exec -u postgres postgres_container_name pg_restore -U ${connectionParams.user} -h ${connectionParams.host} -p ${connectionParams.port} -d ${connectionParams.database} -c ${filePath}`;

//       exec(restoreCmd, (error, stdout, stderr) => {
//         if (error) {
//           console.error(`exec error: ${error}`);
//           res.status(500).send("Error restoring the database");
//           return;
//         }
//         res.status(200).send("Database restore completed");
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.post(
//   "/backup",
//   isSuperAdmin,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const connectionString = process.env.DATABASE_URL || "";
//       const connectionParams = parse(connectionString);
//       const filePath = "/backup.sql";

//       // Replace this with the container name or ID of your Postgres container
//       const postgresContainerName = "/bookmystay-api-db";

//       // Find the Postgres container
//       const containers = await docker.listContainers();
//       const postgresContainerInfo = containers.find(
//         (container) =>
//           container.Names && container.Names.includes(postgresContainerName)
//       );

//       if (!postgresContainerInfo) {
//         res.status(500).send("Postgres container not found");
//         return;
//       }

//       // Create an exec instance with the pg_dump command
//       const postgresContainer = docker.getContainer(postgresContainerInfo.Id);
//       const execOptions = {
//         Cmd: [
//           "pg_dump",
//           "-U",
//           String(connectionParams.user),
//           "-h",
//           String(connectionParams.host),
//           "-p",
//           String(connectionParams.port),
//           "-d",
//           String(connectionParams.database),
//           "-f",
//           String(filePath),
//         ],
//         AttachStdout: true,
//         AttachStderr: true,
//       };

//       const exec = await postgresContainer.exec(execOptions);

//       // Run the exec instance and capture the output
//       exec.start({}, (error, stream) => {
//         if (error) {
//           console.error(`exec error: ${error}`);
//           res.status(500).send("Error backing up the database");
//           return;
//         }

//         if (stream instanceof Stream) {
//           // Log the output for debugging purposes
//           docker.modem.demuxStream(stream, process.stdout, process.stderr);

//           // Close the stream and send a response when the backup is complete
//           stream.on("end", () => {
//             res.status(200).send("Database backup completed");
//           });
//         } else {
//           res.status(500).send("Error: Invalid stream");
//         }
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.post(
//   "/restore",
//   isSuperAdmin,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const connectionString = process.env.DATABASE_URL || "";
//       const connectionParams = parse(connectionString);
//       const filePath = req.body.filePath;

//       // Replace this with the container name or ID of your Postgres container
//       const postgresContainerName = "/bookmystay-api-db";

//       // Find the Postgres container
//       const containers = await docker.listContainers();
//       const postgresContainerInfo = containers.find(
//         (container) =>
//           container.Names && container.Names.includes(postgresContainerName)
//       );

//       if (!postgresContainerInfo) {
//         res.status(500).send("Postgres container not found");
//         return;
//       }

//       // Create an exec instance with the pg_restore command
//       const postgresContainer = docker.getContainer(postgresContainerInfo.Id);
//       const execOptions = {
//         Cmd: [
//           "pg_restore",
//           "-U",
//           connectionParams.user,
//           "-h",
//           connectionParams.host,
//           "-p",
//           connectionParams.port,
//           "-d",
//           connectionParams.database,
//           "-c",
//           filePath,
//         ],
//         AttachStdout: true,
//         AttachStderr: true,
//       };

//       const exec = await postgresContainer.exec(execOptions);

//       // Run the exec instance and capture the output
//       exec.start({}, (error, stream) => {
//         if (error) {
//           console.error(`exec error: ${error}`);
//           res.status(500).send("Error restoring the database");
//           return;
//         }

//         if (stream instanceof Stream) {
//           // Log the output for debugging purposes
//           docker.modem.demuxStream(stream, process.stdout, process.stderr);

//           // Close the stream and send a response when the restore is complete
//           stream.on("end", () => {
//             res.status(200).send("Database restore completed");
//           });
//         } else {
//           res.status(500).send("Error: Invalid stream");
//         }
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// );

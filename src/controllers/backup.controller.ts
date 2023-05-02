import { NextFunction, Request, Response, Router } from 'express';
import { exec as cpExec } from 'child_process';
import { parse } from 'pg-connection-string';
import { config as loadEnvConfig } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { resetDatabase } from '../reset';
import { isSuperAdmin } from '../middleware/isSuperAdmin.middleware';
import Docker from 'dockerode';
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const prisma = new PrismaClient();
const router = Router();

import { Stream } from 'stream';

// Backup Database
router.post(
  '/backup',
  isSuperAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const connectionString = process.env.DATABASE_URL || '';
      const connectionParams = parse(connectionString);
      const pgBinPath = 'C:\\Program Files\\PostgreSQL\\15\\bin\\';
      const pgPassword = process.env.PGPASSWORD || 'postgres';

      const backupCommand = [
        `set PGPASSWORD=${pgPassword} &&`,
        `"${pgBinPath}pg_dump.exe"`,
        '--no-password',
        '-U',
        String(connectionParams.user),
        '-h',
        '127.0.0.1',
        '-p',
        String(connectionParams.port),
        '-d',
        String(connectionParams.database),
        '-f',
        'backup.sql',
      ].join(' ');

      cpExec(backupCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Backup error: ${error}`);
          res.status(500).send('Error backing up the database');
          return;
        }

        console.log('Database backup completed');
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', 'attachment; filename=backup.sql');
        res.sendFile('backup.sql', { root: '.' }, (err) => {
          if (err) {
            next(err);
          } else {
            console.log('Backup file sent');
          }
        });
      });
    } catch (error) {
      next(error);
    }
  },
);
// Restore Database
// Restore Database
router.post(
  '/restore',
  isSuperAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const connectionString = process.env.DATABASE_URL || '';
      const connectionParams = parse(connectionString);
      const filePath = req.body.filePath;
      const pgBinPath = 'C:\\Program Files\\PostgreSQL\\15\\bin\\';
      const pgPassword = process.env.PGPASSWORD || 'postgres';
      const restoreCommand = [
        `set PGPASSWORD=${pgPassword} &&`,
        `"${pgBinPath}pg_restore.exe"`,
        '--no-password',
        '-U',
        String(connectionParams.user),
        '-h',
        String(connectionParams.host),
        '-p',
        String(connectionParams.port),
        '-d',
        String(connectionParams.database),
        '-c',
        filePath,
      ].join(' ');

      cpExec(restoreCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Restore error: ${error}`);
          res.status(500).send('Error restoring the database');
          return;
        }

        console.log('Database restore completed');
        res.status(200).send('Database restore completed');
      });
    } catch (error) {
      next(error);
    }
  },
);

// Secure this endpoint by adding authentication middleware
router.post('/reset-database', isSuperAdmin, async (req, res) => {
  try {
    await resetDatabase(prisma);
    res.status(200).json({ message: 'Database reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset database', details: error });
  }
});

// Export the router
export default router;

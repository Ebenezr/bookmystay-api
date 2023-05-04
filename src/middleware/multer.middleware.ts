import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname),
    );
  },
});

const upload = multer({ storage });

router.post(
  '/upload',
  upload.single('image'),
  (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
    } else {
      res.status(200).json({ imageUrl: `${req.file.filename}` });
    }
  },
);

router.get('/images/:imageName', (req: Request, res: Response) => {
  res.sendFile(path.resolve(process.cwd(), 'uploads', req.params.imageName));
});

export default router;

// import multer from "multer";

// // Set up the storage engine
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "../../uploads/"); // specify the destination directory for the uploaded files
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname); // rename the uploaded file with a unique filename
//   },
// });

// // Create the multer middleware
// const multerMiddleware = multer({ storage });

// export default multerMiddleware;

import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../uploads/');
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
  res.sendFile(path.resolve(process.cwd(), '../uploads', req.params.imageName));
});

export default router;

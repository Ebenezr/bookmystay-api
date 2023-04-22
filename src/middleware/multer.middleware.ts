import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

router.post(
  "/upload",
  upload.single("image"),
  (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded." });
    } else {
      res.status(200).json({ imageUrl: `/images/${req.file.filename}` });
    }
  }
);

router.get("/images/:imageName", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "uploads", req.params.imageName));
});

export default router;

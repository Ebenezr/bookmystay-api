import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryParams {
  folder: string;
  allowed_formats?: string[];
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "Msoko_store",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
  } as CloudinaryParams,
});

const multerMiddleware = multer({ storage });

export default multerMiddleware;

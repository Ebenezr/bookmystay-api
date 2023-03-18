import multer from "multer";

// Set up the storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../../uploads/"); // specify the destination directory for the uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // rename the uploaded file with a unique filename
  },
});

// Create the multer middleware
const multerMiddleware = multer({ storage });

export default multerMiddleware;

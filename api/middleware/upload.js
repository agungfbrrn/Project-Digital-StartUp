import multer from "multer";
import fs from "fs";
import path from "path";

// Create 'uploads' folder if it doesn't exist
const uploadFolder = "uploads";
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// Set up storage options for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder); // Save file to the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Set file name with timestamp to avoid duplicates
  },
});

// Create multer instance with storage configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Optional: Limit file size (10MB)
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|txt|docx/; // Allowed file types
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true); // Accept the file
    } else {
      cb(new Error("Error: File type not supported")); // Reject the file
    }
  },
});

export default upload;

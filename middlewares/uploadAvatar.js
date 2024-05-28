import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "tmp");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${req.user._id}${ext}`;
    cb(null, filename);
  },
});

export const uploadAvatar = multer({ storage });

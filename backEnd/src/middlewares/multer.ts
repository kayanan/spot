import multer, { diskStorage } from "multer";

const storage = diskStorage({
  destination: (req, file, callback) => {
    callback(null, "src/assets");
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + file.originalname);
  },
});

export default multer({ storage: storage }).single("image");

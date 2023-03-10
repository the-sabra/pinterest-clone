import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(path.join(__dirname, "images"));
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    const type = file.mimetype.split("/")[1];
    cb(null, uuidv4() + "." + type);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(express.json());

app.use(
  multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1e6 },
  }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

app.post("/test", (req, res, next) => {
  console.log(req.file);
  res.send("upload complete");
});
import userRoutes from "./routes/user.js";
import pinRoutes from "./routes/pin.js";
import commentRoutes from "./routes/comments.js";
import { toUSVString } from "util";
//User Router
app.use("/user", userRoutes);

//Pins Router
app.use(pinRoutes);

//Comment Router
app.use(commentRoutes);
//error middleware
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({ message: message, data: data, status: false });
});

app.listen(3000);

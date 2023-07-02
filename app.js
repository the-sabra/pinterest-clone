import express from "express";
import multer from "multer";
import bodyParser from "body-parser";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
import { v4 as uuidv4 } from "uuid";
const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(join(__dirname, "images"));
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
app.use(bodyParser.json());
app.use(multer({ storage: storage, fileFilter: fileFilter }).single("image"));

app.use("/images", express.static(join(__dirname, "images")));

import userRoutes from "./routes/user.js";
import pinRoutes from "./routes/pin.js";
import commentRoutes from "./routes/comments.js";
//User Router
app.use("/user", userRoutes);

//Pins Router
app.use(pinRoutes);

//Comment Router
app.use(commentRoutes);
// to solve CORS Errors
// to allow the client side to send data from server
app.use((req, res, next) => {
  res.setHeader("Access-Control-Origin", "*");
  res.setHeader("Access-Control-Methods", "POST,PUT,GET");
  res.setHeader("Access-Control-Headers", "Content-Type, Authorization");
  next();
});
//error middleware
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data, status: false });
});

app.listen(3000);

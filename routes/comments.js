import { Router } from "express";
import checkAuth from "../middleware/isAuth.js";
import * as commetsController from "../controller/comment.js";
import * as validator from "express-validator";
const router = Router();

router.get("/comments/:pinId", commetsController.getComments);

router.post(
  "/comment/:pinId",
  checkAuth,
  [validator.check("content").not().isEmpty().withMessage("content is Empty")],
  commetsController.createComment
);

//reply code
router.post(
  "/comment/reply/:pinId",
  [validator.check("content").not().isEmpty()],
  checkAuth,
  commetsController.replyComment
);

//loves segmants
router.post(
  "/comment/love/:commentId",
  checkAuth,
  commetsController.loveComment
);
router.delete(
  "/comment/love/:commentId",
  checkAuth,
  commetsController.deleteLove
);

router.get("/comment/love/:commentId", commetsController.getLoveCommnet);
export default router;

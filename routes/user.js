import { Router } from "express";
import checkAuth from "../middleware/isAuth.js";
import * as userController from "../controller/user.js";
import * as validator from "express-validator";
const router = Router();

router.post(
  "/signup",
  [
    validator.check("email").trim().isEmail(),
    validator.check("password").trim().isLength({ min: 5 }),
    validator.check("username").trim().not().isEmpty().isLength({ min: 3 }),
    validator.check("country").trim().not().isEmpty(),
    validator.check("name").trim().not().isEmpty(),
  ],
  userController.signup
);

router.post(
  "/login",
  [
    validator.check("email").trim().isEmail(),
    validator.check("password").trim().not().isEmpty(),
  ],
  userController.login
);

router.get("/profile/:username", checkAuth, userController.getProfile);
router.post(
  "/password/reset",
  [validator.check("email").not().isEmpty().isEmail()],
  userController.resetPass
);

router.post(
  "/password/checkValid",
  [validator.check("token").not().isEmpty()],
  userController.tokenValid
);

router.put(
  "/password/reset/:username",
  [validator.check("newPassword").not().isEmpty()],
  userController.newPass
);

router.post("/following/:username", checkAuth, userController.followUser);
router.get("/getFollowing", checkAuth, userController.getfollowing);
router.get("/getFollowers", checkAuth, userController.getFollower);

export default router;

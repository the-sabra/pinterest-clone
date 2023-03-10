import { Router } from "express";
import checkAuth from "../middleware/isAuth.js";
import * as pinController from "../controller/pin.js";
import * as validator from "express-validator";
const router = Router();
//Create Pin
router.post("/pin-builder", checkAuth, pinController.buildPin);

//get Pins
router.get("/pins", pinController.getPins);

//get Pin
router.get("/pin/:pinId" , pinController.getPin);
//Favorite Pin
router.put("/pin/favorite/:pinId", checkAuth, pinController.putFavPin);
router.get("/:username/saved", checkAuth, pinController.getFav);
export default router;

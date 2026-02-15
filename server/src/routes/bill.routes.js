import { Router } from "express";
import { scanBill, getSolPrice } from "../controllers/bill.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/scan").post(scanBill);
router.route("/sol-price").get(getSolPrice);

export default router;

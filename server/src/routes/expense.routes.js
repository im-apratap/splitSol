import { Router } from "express";
import {
  addExpense,
  getGroupExpenses,
  getGroupBalances,
  deleteExpense,
} from "../controllers/expense.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All expense routes are protected
router.use(verifyJWT);

router.route("/").post(addExpense);
router.route("/group/:groupId").get(getGroupExpenses);
router.route("/balances/:groupId").get(getGroupBalances);
router.route("/:expenseId").delete(deleteExpense);

export default router;

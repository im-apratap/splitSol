import mongoose from "mongoose";

const expenseSchema = mongoose.Schema(
  {
    description: {
      required: true,
    },
    amount: {
      required: true,
    },
    paidBy: {
      required: true,
    },
    splitAmong: {
      required: true
    },
    groupId: {
        required: true,
        unique: true
    }
  },
  { timestamps: true },
);

export const Expense = mongoose.model("Expense", expenseSchema);
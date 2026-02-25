import { Expense } from "../models/expense.model.js";
import { Group } from "../models/group.model.js";
import { Settlement } from "../models/settlement.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const addExpense = async (req, res, next) => {
  try {
    const { description, amount, groupId, splitType, splitAmong, shares } =
      req.body;

    if (!description || !amount || !groupId) {
      throw new ApiError(400, "Description, amount, and groupId are required");
    }

    const group = await Group.findById(groupId);
    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    const isMember = group.members.some(
      (member) => member.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      throw new ApiError(403, "You are not a member of this group");
    }

    const participants = splitAmong || group.members;

    if (splitType === "custom" && shares) {
      const totalShares = shares.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(totalShares - amount) > 0.01) {
        throw new ApiError(
          400,
          "Custom shares must add up to the total amount",
        );
      }
    }

    if (splitType === "percentage" && shares) {
      const totalPercentage = shares.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new ApiError(400, "Percentage shares must add up to 100");
      }
    }

    const expense = await Expense.create({
      description,
      amount,
      paidBy: req.user._id,
      groupId,
      splitType: splitType || "equal",
      splitAmong: participants,
      shares: shares || [],
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate("paidBy", "name username pubKey")
      .populate("splitAmong", "name username pubKey")
      .populate("shares.user", "name username pubKey");

    return res
      .status(201)
      .json(
        new ApiResponse(201, populatedExpense, "Expense added successfully"),
      );
  } catch (error) {
    next(error);
  }
};

export const getGroupExpenses = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    const isMember = group.members.some(
      (member) => member.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      throw new ApiError(403, "You are not a member of this group");
    }

    const expenses = await Expense.find({ groupId })
      .populate("paidBy", "name username pubKey")
      .populate("splitAmong", "name username pubKey")
      .populate("shares.user", "name username pubKey")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
  } catch (error) {
    next(error);
  }
};

export const getGroupBalances = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate(
      "members",
      "name username pubKey",
    );
    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    const isMember = group.members.some(
      (member) => member._id.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      throw new ApiError(403, "You are not a member of this group");
    }

    const expenses = await Expense.find({ groupId });

    const balances = {};
    group.members.forEach((member) => {
      balances[member._id.toString()] = 0;
    });

    for (const expense of expenses) {
      const payerId = expense.paidBy.toString();

      if (expense.splitType === "equal") {
        const perPerson = expense.amount / expense.splitAmong.length;
        balances[payerId] += expense.amount;
        expense.splitAmong.forEach((userId) => {
          balances[userId.toString()] -= perPerson;
        });
      } else if (expense.splitType === "custom" && expense.shares.length > 0) {
        balances[payerId] += expense.amount;
        expense.shares.forEach((share) => {
          balances[share.user.toString()] -= share.amount;
        });
      } else if (
        expense.splitType === "percentage" &&
        expense.shares.length > 0
      ) {
        balances[payerId] += expense.amount;
        expense.shares.forEach((share) => {
          balances[share.user.toString()] -=
            (share.amount / 100) * expense.amount;
        });
      }
    }

    // Fetch all confirmed settlements for this group
    const confirmedSettlements = await Settlement.find({
      groupId,
      status: "confirmed",
    });

    // Apply settlements to balances
    for (const settlement of confirmedSettlements) {
      const fromId = settlement.from.toString();
      const toId = settlement.to.toString();
      // 'from' paid 'to', so 'from' balance increases (less debt), 'to' balance decreases (less credit)
      if (balances[fromId] !== undefined) balances[fromId] += settlement.amount;
      if (balances[toId] !== undefined) balances[toId] -= settlement.amount;
    }

    const settlements = calculateSettlements(balances);

    const memberMap = {};
    group.members.forEach((member) => {
      memberMap[member._id.toString()] = {
        _id: member._id,
        name: member.name,
        username: member.username,
        pubKey: member.pubKey,
      };
    });

    const balanceDetails = Object.entries(balances).map(([userId, amount]) => ({
      user: memberMap[userId],
      netBalance: Math.round(amount * 100) / 100,
    }));

    const settlementDetails = settlements.map((s) => ({
      from: memberMap[s.from],
      to: memberMap[s.to],
      amount: Math.round(s.amount * 100) / 100,
    }));

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          balances: balanceDetails,
          settlements: settlementDetails,
        },
        "Balances calculated successfully",
      ),
    );
  } catch (error) {
    next(error);
  }
};

// Greedy algorithm: settle debts with minimum transactions
function calculateSettlements(balances) {
  const settlements = [];

  // Separate into debtors (negative) and creditors (positive)
  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([userId, amount]) => {
    const rounded = Math.round(amount * 100) / 100;
    if (rounded < -0.01) {
      debtors.push({ userId, amount: Math.abs(rounded) });
    } else if (rounded > 0.01) {
      creditors.push({ userId, amount: rounded });
    }
  });

  // Sort both by amount descending
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const settleAmount = Math.min(debtors[i].amount, creditors[j].amount);

    if (settleAmount > 0.01) {
      settlements.push({
        from: debtors[i].userId,
        to: creditors[j].userId,
        amount: settleAmount,
      });
    }

    debtors[i].amount -= settleAmount;
    creditors[j].amount -= settleAmount;

    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return settlements;
}

export const deleteExpense = async (req, res, next) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      throw new ApiError(404, "Expense not found");
    }

    const group = await Group.findById(expense.groupId);
    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    // Any member of the group can delete the expense
    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      throw new ApiError(403, "You are not a member of this group");
    }

    await Expense.findByIdAndDelete(expenseId);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Expense deleted successfully"));
  } catch (error) {
    next(error);
  }
};

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";
import connectDB from "./config/db.js";
import { errorHandler } from "./middlewares/error.middleware.js";

// Route imports
import userRoutes from "./routes/user.routes.js";
import groupRoutes from "./routes/group.routes.js";
import expenseRoutes from "./routes/expense.routes.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "splitSolana API is running" });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);

// Global error handler (must be after routes)
app.use(errorHandler);

// Connect DB and start server
connectDB().then(() => {
  app.listen(ENV.PORT, () => {
    console.log(`Server running on PORT ${ENV.PORT}`);
  });
});

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";
import connectDB from "./config/db.js";
import { errorHandler } from "./middlewares/error.middleware.js";

import userRoutes from "./routes/user.routes.js";
import groupRoutes from "./routes/group.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import settlementRoutes from "./routes/settlement.routes.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "splitSolana is running, hurray..." });
});

app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/settlements", settlementRoutes);

// Global error handler (must be after routes)
app.use(errorHandler);

const startServer = async()=> {
  try {
    connectDB()
    if(ENV.NODE_ENV !== "production"){
      app.listen(ENV.PORT, () => {
        console.log(`Server running on PORT ${ENV.PORT}`);
      })
    }
  } catch (error) {
    console.log("Error while starting the Server");
    process.exit(1)
  }
}

startServer()

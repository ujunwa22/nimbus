import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./Routes/authRouter.js";
import assessmentRoutes from "./Routes/assessmentRouter.js";
import attemptRoutes from "./Routes/attemptRouter.js";
import userRoutes from "./Routes/userRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Nimbus API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Nimbus API running on http://localhost:${PORT}`);
});
console.log("Joshua");

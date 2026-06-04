import { Router } from "express";
import {
  getProfile,
  getStudentDashboard,
  getTeacherDashboard,
} from "../Controllers/userController.js";
import { protect, requireRole } from "../Middleware/authMiddleware.js";

const router = Router();

router.get("/profile", protect, getProfile);
router.get(
  "/dashboard/student",
  protect,
  requireRole("STUDENT"),
  getStudentDashboard,
);
router.get(
  "/dashboard/teacher",
  protect,
  requireRole("TEACHER"),
  getTeacherDashboard,
);

export default router;

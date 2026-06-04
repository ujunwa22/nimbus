import { Router } from "express";
import {
  createAssessment,
  getAllAssessments,
  getAssessment,
  getTeacherAssessments,
  deleteAssessment,
} from "../Controllers/assessmentController.js";
import { protect, requireRole } from "../Middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, getAllAssessments);
router.get("/my", protect, requireRole("TEACHER"), getTeacherAssessments);
router.get("/:id", protect, getAssessment);
router.post("/", protect, requireRole("TEACHER"), createAssessment);
router.delete("/:id", protect, requireRole("TEACHER"), deleteAssessment);

export default router;

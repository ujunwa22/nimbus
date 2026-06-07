import { Router } from "express";
import {
  startAttempt,
  submitAttempt,
  getMyAttempts,
  getAttemptResult,
  getAssessmentResults,
} from "../Controllers/attemptController.js";
import { protect, requireRole } from "../Middleware/authMiddleware.js";

const router = Router();

router.post("/start", protect, requireRole("STUDENT"), startAttempt);
router.post("/:id/submit", protect, requireRole("STUDENT"), submitAttempt);
router.get("/my", protect, requireRole("STUDENT"), getMyAttempts);
router.get("/:id/result", protect, getAttemptResult);
router.get(
  "/assessment/:assessmentId/results",
  protect,
  requireRole("TEACHER"),
  getAssessmentResults,
);

export default router;

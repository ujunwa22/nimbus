import prisma from "../Models/prisma.js";

export const startAttempt = async (req, res) => {
  try {
    const { assessmentId } = req.body;

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: true },
    });
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found.",
      });
    }

    const existing = await prisma.attempt.findFirst({
      where: {
        studentId: req.user.id,
        assessmentId,
        submittedAt: null,
      },
    });
    if (existing) return res.json({ success: true, data: existing });

    const attempt = await prisma.attempt.create({
      data: { studentId: req.user.id, assessmentId },
    });

    res.status(201).json({ success: true, data: attempt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitAttempt = async (req, res) => {
  try {
    const { answers } = req.body;
    const attemptId = req.params.id;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: {
          include: {
            questions: { include: { options: true } },
          },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found.",
      });
    }
    if (attempt.studentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized.",
      });
    }
    if (attempt.submittedAt) {
      return res.status(400).json({
        success: false,
        message: "Already submitted.",
      });
    }

    // Auto-grading engine
    let totalScore = 0;
    let maxScore = 0;
    const gradedAnswers = [];

    for (const question of attempt.assessment.questions) {
      maxScore += question.points;
      const userAnswer = answers.find((a) => a.questionId === question.id);
      let isCorrect = false;
      let points = 0;

      if (userAnswer) {
        const correctOption = question.options.find((o) => o.isCorrect);
        isCorrect = correctOption?.id === userAnswer.value;
        points = isCorrect ? question.points : 0;
        totalScore += points;
      }

      gradedAnswers.push({
        attemptId,
        questionId: question.id,
        value: userAnswer?.value || "",
        isCorrect,
        points,
      });
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    await prisma.answer.createMany({ data: gradedAnswers });

    const updatedAttempt = await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        score: totalScore,
        maxScore,
        percentage,
        submittedAt: new Date(),
      },
      include: {
        answers: {
          include: {
            question: { include: { options: true } },
          },
        },
        assessment: { select: { title: true } },
      },
    });

    res.json({ success: true, data: updatedAttempt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyAttempts = async (req, res) => {
  try {
    const attempts = await prisma.attempt.findMany({
      where: {
        studentId: req.user.id,
        submittedAt: { not: null },
      },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            course: { select: { title: true } },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });
    res.json({ success: true, data: attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAttemptResult = async (req, res) => {
  try {
    const attempt = await prisma.attempt.findUnique({
      where: { id: req.params.id },
      include: {
        assessment: {
          select: {
            title: true,
            course: { select: { title: true } },
          },
        },
        answers: {
          include: {
            question: { include: { options: true } },
          },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Not found.",
      });
    }
    if (attempt.studentId !== req.user.id && req.user.role !== "TEACHER") {
      return res.status(403).json({
        success: false,
        message: "Not authorized.",
      });
    }

    res.json({ success: true, data: attempt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAssessmentResults = async (req, res) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.assessmentId },
    });
    if (!assessment || assessment.teacherId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized.",
      });
    }

    const attempts = await prisma.attempt.findMany({
      where: {
        assessmentId: req.params.assessmentId,
        submittedAt: { not: null },
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { submittedAt: "desc" },
    });

    res.json({ success: true, data: attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

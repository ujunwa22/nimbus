import prisma from "../Models/prisma.js";

export const createAssessment = async (req, res) => {
  try {
    const { title, description, timeLimit, questions } = req.body;

    if (!title || !questions?.length) {
      return res.status(400).json({
        success: false,
        message: "Title and questions are required.",
      });
    }

    const assessment = await prisma.assessment.create({
      data: {
        title,
        description,
        teacherId: req.user.id,
        timeLimit: timeLimit || null,
        questions: {
          create: questions.map((q) => ({
            text: q.text,
            type: ["MULTIPLE_CHOICE", "TRUE_FALSE"].includes(q.type)
              ? q.type
              : "MULTIPLE_CHOICE",
            points: q.points || 1,
            options: {
              create: (q.options || []).map((o) => ({
                text: o.text,
                isCorrect: o.isCorrect || false,
              })),
            },
          })),
        },
      },
      include: { questions: { include: { options: true } } },
    });

    res.status(201).json({ success: true, data: assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllAssessments = async (req, res) => {
  try {
    const assessments = await prisma.assessment.findMany({
      include: {
        teacher: { select: { id: true, name: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: assessments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAssessment = async (req, res) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: { select: { id: true, name: true } },
        questions: {
          include: {
            options: {
              select: {
                id: true,
                text: true,
                isCorrect: req.user.role === "TEACHER",
              },
            },
          },
        },
        _count: { select: { attempts: true } },
      },
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found.",
      });
    }
    res.json({ success: true, data: assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTeacherAssessments = async (req, res) => {
  try {
    const assessments = await prisma.assessment.findMany({
      where: { teacherId: req.user.id },
      include: {
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: assessments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAssessment = async (req, res) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id },
    });
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Not found.",
      });
    }
    if (assessment.teacherId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized.",
      });
    }
    await prisma.assessment.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Assessment deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

import prisma from "../Models/prisma.js";

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            assessments: true,
            attempts: true,
          },
        },
      },
    });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStudentDashboard = async (req, res) => {
  try {
    const recentAttempts = await prisma.attempt.findMany({
      where: {
        studentId: req.user.id,
        submittedAt: { not: null },
      },
      include: {
        assessment: {
          select: { id: true, title: true },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 5,
    });

    const allAttempts = await prisma.attempt.findMany({
      where: {
        studentId: req.user.id,
        submittedAt: { not: null },
      },
      select: { percentage: true },
    });

    const avgScore = allAttempts.length
      ? allAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) /
        allAttempts.length
      : 0;

    res.json({
      success: true,
      data: {
        recentAttempts,
        stats: {
          totalAttempts: allAttempts.length,
          avgScore: Math.round(avgScore),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTeacherDashboard = async (req, res) => {
  try {
    const [assessments, recentAttempts] = await Promise.all([
      prisma.assessment.findMany({
        where: { teacherId: req.user.id },
        include: {
          _count: { select: { questions: true, attempts: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.attempt.findMany({
        where: {
          assessment: { teacherId: req.user.id },
          submittedAt: { not: null },
        },
        include: {
          student: { select: { name: true } },
          assessment: { select: { title: true } },
        },
        orderBy: { submittedAt: "desc" },
        take: 10,
      }),
    ]);

    const totalStudents = await prisma.attempt.groupBy({
      by: ["studentId"],
      where: {
        assessment: { teacherId: req.user.id },
      },
    });

    res.json({
      success: true,
      data: {
        assessments,
        recentAttempts,
        stats: {
          totalAssessments: assessments.length,
          totalStudents: totalStudents.length,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

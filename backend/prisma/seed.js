import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@nimbus.com" },
    update: {},
    create: {
      name: "Dr. Sarah Collins",
      email: "teacher@nimbus.com",
      password: await bcrypt.hash("password123", 12),
      role: "TEACHER",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@nimbus.com" },
    update: {},
    create: {
      name: "Alex Johnson",
      email: "student@nimbus.com",
      password: await bcrypt.hash("password123", 12),
      role: "STUDENT",
    },
  });

  await prisma.assessment.create({
    data: {
      title: "Week 1 Quiz: Programming Basics",
      description: "Test your knowledge of basic programming.",
      teacherId: teacher.id,
      timeLimit: 30,
      questions: {
        create: [
          {
            text: "What is a variable in programming?",
            type: "MULTIPLE_CHOICE",
            points: 2,
            options: {
              create: [
                { text: "A fixed value that never changes", isCorrect: false },
                { text: "A named storage location for data", isCorrect: true },
                { text: "A type of loop", isCorrect: false },
                { text: "A programming language", isCorrect: false },
              ],
            },
          },
          {
            text: "Is Python a compiled language?",
            type: "TRUE_FALSE",
            points: 1,
            options: {
              create: [
                { text: "True", isCorrect: false },
                { text: "False", isCorrect: true },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seed complete!");
  console.log("Teacher: teacher@nimbus.com / password123");
  console.log("Student: student@nimbus.com / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

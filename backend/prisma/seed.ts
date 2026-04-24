import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dzidzai.com' },
    update: {},
    create: {
      email: 'admin@dzidzai.com',
      password: adminPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
    },
  });

  // Create teacher user
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@dzidzai.com' },
    update: {},
    create: {
      email: 'teacher@dzidzai.com',
      password: teacherPassword,
      role: 'TEACHER',
      firstName: 'Teacher',
      lastName: 'User',
      isActive: true,
    },
  });

  // Create parent user
  const parentPassword = await bcrypt.hash('parent123', 10);
  const parent = await prisma.user.upsert({
    where: { email: 'parent@dzidzai.com' },
    update: {},
    create: {
      email: 'parent@dzidzai.com',
      password: parentPassword,
      role: 'PARENT',
      firstName: 'Parent',
      lastName: 'User',
      isActive: true,
    },
  });

  // Create student user
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@dzidzai.com' },
    update: {},
    create: {
      email: 'student@dzidzai.com',
      password: studentPassword,
      role: 'STUDENT',
      firstName: 'Student',
      lastName: 'User',
      isActive: true,
    },
  });

  // Create children for the parent
  const child1 = await prisma.child.create({
    data: {
      name: 'Shaurya',
      gradeLevel: 2, // Grade 2
      preferredLanguage: 'SHONA',
      parentId: parent.id,
    },
  });

  const child2 = await prisma.child.create({
    data: {
      name: 'Rahul',
      gradeLevel: 3, // Grade 3
      preferredLanguage: 'NDEBELE',
      parentId: parent.id,
    },
  });

  // Create child account for student (student acts as their own parent)
  const studentChild = await prisma.child.create({
    data: {
      name: 'Student User',
      gradeLevel: 4, // Grade 4
      preferredLanguage: 'ENGLISH',
      parentId: student.id,
      userId: student.id,
    },
  });

  console.log('Seeding finished.');
  console.log('Users created:');
  console.log('- Admin: admin@dzidzai.com / admin123');
  console.log('- Teacher: teacher@dzidzai.com / teacher123');
  console.log('- Parent: parent@dzidzai.com / parent123');
  console.log('- Student: student@dzidzai.com / student123');
  console.log('Children created:');
  console.log('- Shaurya (Grade 2, Shona)');
  console.log('- Rahul (Grade 3, Ndebele)');
  console.log('- Student User (Grade 4, English)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

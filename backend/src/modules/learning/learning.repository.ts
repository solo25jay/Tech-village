import { prisma } from '@database/prisma';

export const learningRepository = {
  // ---- Learning Paths ----
  listPublishedPaths() {
    return prisma.learningPath.findMany({
      where: { isPublished: true },
      include: { courses: { where: { isPublished: true }, select: { id: true } } },
      orderBy: { createdAt: 'asc' },
    });
  },

  listAllPaths() {
    return prisma.learningPath.findMany({ orderBy: { createdAt: 'desc' } });
  },

  findPathBySlug(slug: string) {
    return prisma.learningPath.findUnique({
      where: { slug },
      include: { courses: { where: { isPublished: true } } },
    });
  },

  createPath(data: {
    slug: string;
    name: string;
    description: string;
    difficulty: string;
    durationWeeks?: number;
    skills: string[];
  }) {
    return prisma.learningPath.create({ data });
  },

  setPathPublished(id: string, isPublished: boolean) {
    return prisma.learningPath.update({ where: { id }, data: { isPublished } });
  },

  // ---- Courses ----
  listPublishedCourses() {
    return prisma.course.findMany({
      where: { isPublished: true },
      include: { learningPath: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  listAllCourses() {
    return prisma.course.findMany({
      include: { learningPath: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  findCourseById(id: string) {
    return prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: { lessons: { orderBy: { order: 'asc' } } },
        },
      },
    });
  },

  createCourse(data: {
    title: string;
    description: string;
    thumbnailUrl?: string;
    instructorId?: string;
    learningPathId?: string;
  }) {
    return prisma.course.create({ data });
  },

  setCoursePublished(id: string, isPublished: boolean) {
    return prisma.course.update({ where: { id }, data: { isPublished } });
  },

  // ---- Modules & Lessons ----
  createModule(data: { courseId: string; title: string; order: number }) {
    return prisma.module.create({ data });
  },

  createLesson(data: {
    moduleId: string;
    title: string;
    contentType: 'VIDEO' | 'TEXT' | 'RESOURCE';
    contentUrl?: string;
    contentBody?: string;
    order: number;
  }) {
    return prisma.lesson.create({ data });
  },

  // ---- Enrollment ----
  findEnrollment(userId: string, courseId: string) {
    return prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
  },

  enroll(userId: string, courseId: string) {
    return prisma.enrollment.create({ data: { userId, courseId } });
  },

  listUserEnrollments(userId: string) {
    return prisma.enrollment.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { enrolledAt: 'desc' },
    });
  },

  markEnrollmentCompleted(userId: string, courseId: string) {
    return prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: { completedAt: new Date() },
    });
  },

  // ---- Progress ----
  listUserProgressForCourse(userId: string, courseId: string) {
    return prisma.progress.findMany({
      where: { userId, lesson: { module: { courseId } } },
    });
  },

  upsertLessonProgress(userId: string, lessonId: string, completed: boolean) {
    return prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completedAt: completed ? new Date() : null },
      create: { userId, lessonId, completedAt: completed ? new Date() : null },
    });
  },

  countLessonsInCourse(courseId: string) {
    return prisma.lesson.count({ where: { module: { courseId } } });
  },
};

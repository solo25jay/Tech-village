import { ApiError } from '@common/ApiError';
import { learningRepository } from './learning.repository';

export const learningService = {
  listLearningPaths() {
    return learningRepository.listPublishedPaths();
  },

  async getLearningPath(slug: string) {
    const path = await learningRepository.findPathBySlug(slug);
    if (!path) throw ApiError.notFound('Learning path not found');
    return path;
  },

  listCourses() {
    return learningRepository.listPublishedCourses();
  },

  async getCourse(courseId: string, userId: string) {
    const course = await learningRepository.findCourseById(courseId);
    if (!course || !course.isPublished) throw ApiError.notFound('Course not found');

    const progressRecords = await learningRepository.listUserProgressForCourse(userId, courseId);
    const completedLessonIds = new Set(
      progressRecords.filter((p) => p.completedAt).map((p) => p.lessonId),
    );

    return {
      ...course,
      modules: course.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => ({ ...l, completed: completedLessonIds.has(l.id) })),
      })),
    };
  },

  async enroll(userId: string, courseId: string) {
    const existing = await learningRepository.findEnrollment(userId, courseId);
    if (existing) throw ApiError.conflict('Already enrolled in this course');
    return learningRepository.enroll(userId, courseId);
  },

  listMyEnrollments(userId: string) {
    return learningRepository.listUserEnrollments(userId);
  },

  async setLessonProgress(userId: string, courseId: string, lessonId: string, completed: boolean) {
    const enrollment = await learningRepository.findEnrollment(userId, courseId);
    if (!enrollment) throw ApiError.forbidden('You are not enrolled in this course');

    await learningRepository.upsertLessonProgress(userId, lessonId, completed);

    // Auto-complete the enrollment once every lesson in the course is done.
    const totalLessons = await learningRepository.countLessonsInCourse(courseId);
    const progressRecords = await learningRepository.listUserProgressForCourse(userId, courseId);
    const completedCount = progressRecords.filter((p) => p.completedAt).length;

    if (totalLessons > 0 && completedCount >= totalLessons && !enrollment.completedAt) {
      await learningRepository.markEnrollmentCompleted(userId, courseId);
    }

    return {
      completedLessons: completedCount,
      totalLessons,
      progressPercent: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
    };
  },
};

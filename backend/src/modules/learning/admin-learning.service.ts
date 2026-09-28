import { learningRepository } from './learning.repository';

export const adminLearningService = {
  listAllPaths() {
    return learningRepository.listAllPaths();
  },

  createPath(input: {
    name: string;
    description: string;
    difficulty: string;
    durationWeeks?: number;
    skills: string[];
  }) {
    const slug = input.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return learningRepository.createPath({ ...input, slug });
  },

  publishPath(id: string, isPublished: boolean) {
    return learningRepository.setPathPublished(id, isPublished);
  },

  listAllCourses() {
    return learningRepository.listAllCourses();
  },

  createCourse(input: {
    title: string;
    description: string;
    thumbnailUrl?: string;
    instructorId?: string;
    learningPathId?: string;
  }) {
    return learningRepository.createCourse(input);
  },

  publishCourse(id: string, isPublished: boolean) {
    return learningRepository.setCoursePublished(id, isPublished);
  },

  createModule(input: { courseId: string; title: string; order: number }) {
    return learningRepository.createModule(input);
  },

  createLesson(input: {
    moduleId: string;
    title: string;
    contentType: 'VIDEO' | 'TEXT' | 'RESOURCE';
    contentUrl?: string;
    contentBody?: string;
    order: number;
  }) {
    return learningRepository.createLesson(input);
  },

  getCourseWithContent(courseId: string) {
    return learningRepository.findCourseById(courseId);
  },
};

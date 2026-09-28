import { api } from './api';

export interface LearningPath {
  id: string;
  slug: string;
  name: string;
  description: string;
  difficulty: string;
  durationWeeks: number | null;
  skills: string[];
  isPublished: boolean;
  courses: { id: string }[];
}

export interface CourseSummary {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  isPublished: boolean;
  learningPath: { id: string; name: string } | null;
}

export interface Lesson {
  id: string;
  title: string;
  contentType: 'VIDEO' | 'TEXT' | 'RESOURCE';
  contentUrl: string | null;
  contentBody: string | null;
  order: number;
  completed?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface CourseDetail extends CourseSummary {
  modules: CourseModule[];
}

export interface Enrollment {
  id: string;
  courseId: string;
  enrolledAt: string;
  completedAt: string | null;
  course: CourseSummary;
}

export const learningApi = {
  listPaths: () => api.get<{ data: LearningPath[] }>('/learning/paths'),
  listCourses: () => api.get<{ data: CourseSummary[] }>('/learning/courses'),
  getCourse: (courseId: string) => api.get<{ data: CourseDetail }>(`/learning/courses/${courseId}`),
  enroll: (courseId: string) => api.post('/learning/enrollments', { courseId }),
  myEnrollments: () => api.get<{ data: Enrollment[] }>('/learning/enrollments/me'),
  setLessonProgress: (courseId: string, lessonId: string, completed: boolean) =>
    api.put<{ data: { completedLessons: number; totalLessons: number; progressPercent: number } }>(
      `/learning/courses/${courseId}/lessons/${lessonId}/progress`,
      { completed },
    ),
};

export const adminLearningApi = {
  listPaths: () => api.get<{ data: LearningPath[] }>('/admin/learning/paths'),
  createPath: (input: {
    name: string;
    description: string;
    difficulty: string;
    durationWeeks?: number;
    skills: string[];
  }) => api.post('/admin/learning/paths', input),
  publishPath: (id: string, isPublished: boolean) =>
    api.patch(`/admin/learning/paths/${id}/publish`, { isPublished }),

  listCourses: () => api.get<{ data: CourseSummary[] }>('/admin/learning/courses'),
  createCourse: (input: { title: string; description: string; learningPathId?: string }) =>
    api.post('/admin/learning/courses', input),
  publishCourse: (id: string, isPublished: boolean) =>
    api.patch(`/admin/learning/courses/${id}/publish`, { isPublished }),
  getCourse: (id: string) => api.get<{ data: CourseDetail }>(`/admin/learning/courses/${id}`),

  createModule: (input: { courseId: string; title: string; order: number }) =>
    api.post('/admin/learning/modules', input),
  createLesson: (input: {
    moduleId: string;
    title: string;
    contentType: 'VIDEO' | 'TEXT' | 'RESOURCE';
    contentUrl?: string;
    contentBody?: string;
    order: number;
  }) => api.post('/admin/learning/lessons', input),
};

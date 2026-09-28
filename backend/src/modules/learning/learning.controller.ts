import type { Request, Response } from 'express';
import { learningService } from './learning.service';
import { enrollSchema, lessonProgressSchema } from './learning.validation';

export const learningController = {
  async listPaths(_req: Request, res: Response) {
    const paths = await learningService.listLearningPaths();
    res.json({ data: paths });
  },

  async getPath(req: Request, res: Response) {
    const path = await learningService.getLearningPath(req.params.slug);
    res.json({ data: path });
  },

  async listCourses(_req: Request, res: Response) {
    const courses = await learningService.listCourses();
    res.json({ data: courses });
  },

  async getCourse(req: Request, res: Response) {
    const course = await learningService.getCourse(req.params.courseId, req.auth!.userId);
    res.json({ data: course });
  },

  async enroll(req: Request, res: Response) {
    const input = enrollSchema.parse(req.body);
    const enrollment = await learningService.enroll(req.auth!.userId, input.courseId);
    res.status(201).json({ data: enrollment });
  },

  async myEnrollments(req: Request, res: Response) {
    const enrollments = await learningService.listMyEnrollments(req.auth!.userId);
    res.json({ data: enrollments });
  },

  async setLessonProgress(req: Request, res: Response) {
    const input = lessonProgressSchema.parse(req.body);
    const result = await learningService.setLessonProgress(
      req.auth!.userId,
      req.params.courseId,
      req.params.lessonId,
      input.completed,
    );
    res.json({ data: result });
  },
};

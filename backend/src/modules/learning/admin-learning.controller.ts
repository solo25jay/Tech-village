import type { Request, Response } from 'express';
import { adminLearningService } from './admin-learning.service';
import {
  createCourseSchema,
  createLessonSchema,
  createModuleSchema,
  createPathSchema,
  publishSchema,
} from './learning.validation';

export const adminLearningController = {
  async listPaths(_req: Request, res: Response) {
    res.json({ data: await adminLearningService.listAllPaths() });
  },

  async createPath(req: Request, res: Response) {
    const input = createPathSchema.parse(req.body);
    const path = await adminLearningService.createPath(input);
    res.status(201).json({ data: path });
  },

  async publishPath(req: Request, res: Response) {
    const input = publishSchema.parse(req.body);
    const path = await adminLearningService.publishPath(req.params.id, input.isPublished);
    res.json({ data: path });
  },

  async listCourses(_req: Request, res: Response) {
    res.json({ data: await adminLearningService.listAllCourses() });
  },

  async createCourse(req: Request, res: Response) {
    const input = createCourseSchema.parse(req.body);
    const course = await adminLearningService.createCourse(input);
    res.status(201).json({ data: course });
  },

  async publishCourse(req: Request, res: Response) {
    const input = publishSchema.parse(req.body);
    const course = await adminLearningService.publishCourse(req.params.id, input.isPublished);
    res.json({ data: course });
  },

  async getCourse(req: Request, res: Response) {
    res.json({ data: await adminLearningService.getCourseWithContent(req.params.id) });
  },

  async createModule(req: Request, res: Response) {
    const input = createModuleSchema.parse(req.body);
    const mod = await adminLearningService.createModule(input);
    res.status(201).json({ data: mod });
  },

  async createLesson(req: Request, res: Response) {
    const input = createLessonSchema.parse(req.body);
    const lesson = await adminLearningService.createLesson(input);
    res.status(201).json({ data: lesson });
  },
};

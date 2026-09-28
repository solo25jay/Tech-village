import type { Request, Response } from 'express';
import { productivityService } from './productivity.service';
import {
  addMilestoneSchema,
  addRoadmapMilestoneSchema,
  createGoalSchema,
  createRoadmapSchema,
  createTaskSchema,
  toggleSchema,
  updateGoalSchema,
  updateTaskSchema,
} from './productivity.validation';

export const productivityController = {
  // Goals
  async listGoals(req: Request, res: Response) {
    res.json({ data: await productivityService.listGoals(req.auth!.userId) });
  },
  async createGoal(req: Request, res: Response) {
    const input = createGoalSchema.parse(req.body);
    res.status(201).json({ data: await productivityService.createGoal(req.auth!.userId, input) });
  },
  async updateGoal(req: Request, res: Response) {
    const input = updateGoalSchema.parse(req.body);
    res.json({ data: await productivityService.updateGoal(req.auth!.userId, req.params.goalId, input) });
  },
  async deleteGoal(req: Request, res: Response) {
    await productivityService.deleteGoal(req.auth!.userId, req.params.goalId);
    res.status(204).send();
  },
  async addMilestone(req: Request, res: Response) {
    const input = addMilestoneSchema.parse(req.body);
    res
      .status(201)
      .json({ data: await productivityService.addMilestone(req.auth!.userId, req.params.goalId, input.title) });
  },
  async toggleMilestone(req: Request, res: Response) {
    const input = toggleSchema.parse(req.body);
    res.json({
      data: await productivityService.toggleMilestone(
        req.auth!.userId,
        req.params.goalId,
        req.params.milestoneId,
        input.completed,
      ),
    });
  },

  // Roadmaps
  async listRoadmaps(req: Request, res: Response) {
    res.json({ data: await productivityService.listRoadmaps(req.auth!.userId) });
  },
  async listTemplates(_req: Request, res: Response) {
    res.json({ data: await productivityService.listRoadmapTemplates() });
  },
  async createRoadmap(req: Request, res: Response) {
    const input = createRoadmapSchema.parse(req.body);
    res.status(201).json({ data: await productivityService.createRoadmap(req.auth!.userId, input) });
  },
  async cloneTemplate(req: Request, res: Response) {
    res.status(201).json({ data: await productivityService.cloneTemplate(req.auth!.userId, req.params.templateId) });
  },
  async addRoadmapMilestone(req: Request, res: Response) {
    const input = addRoadmapMilestoneSchema.parse(req.body);
    res.status(201).json({
      data: await productivityService.addRoadmapMilestone(
        req.auth!.userId,
        req.params.roadmapId,
        input.title,
        input.deadline,
      ),
    });
  },
  async toggleRoadmapMilestone(req: Request, res: Response) {
    const input = toggleSchema.parse(req.body);
    res.json({
      data: await productivityService.toggleRoadmapMilestone(
        req.auth!.userId,
        req.params.roadmapId,
        req.params.milestoneId,
        input.completed,
      ),
    });
  },
  async deleteRoadmap(req: Request, res: Response) {
    await productivityService.deleteRoadmap(req.auth!.userId, req.params.roadmapId);
    res.status(204).send();
  },

  // Tasks
  async listTasks(req: Request, res: Response) {
    res.json({ data: await productivityService.listTasks(req.auth!.userId) });
  },
  async createTask(req: Request, res: Response) {
    const input = createTaskSchema.parse(req.body);
    res.status(201).json({ data: await productivityService.createTask(req.auth!.userId, input) });
  },
  async updateTask(req: Request, res: Response) {
    const input = updateTaskSchema.parse(req.body);
    res.json({ data: await productivityService.updateTask(req.auth!.userId, req.params.taskId, input) });
  },
  async setTaskCompleted(req: Request, res: Response) {
    const input = toggleSchema.parse(req.body);
    res.json({
      data: await productivityService.setTaskCompleted(req.auth!.userId, req.params.taskId, input.completed),
    });
  },
  async deleteTask(req: Request, res: Response) {
    await productivityService.deleteTask(req.auth!.userId, req.params.taskId);
    res.status(204).send();
  },
};

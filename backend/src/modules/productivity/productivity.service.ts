import { ApiError } from '@common/ApiError';
import { productivityRepository } from './productivity.repository';

function withGoalProgress<T extends { milestones: { completedAt: Date | null }[] }>(goal: T) {
  const total = goal.milestones.length;
  const done = goal.milestones.filter((m) => m.completedAt).length;
  return { ...goal, progressPercent: total > 0 ? Math.round((done / total) * 100) : 0 };
}

export const productivityService = {
  // ---- Goals ----
  async listGoals(userId: string) {
    const goals = await productivityRepository.listGoals(userId);
    return goals.map(withGoalProgress);
  },

  async createGoal(userId: string, input: {
    title: string;
    description?: string;
    category?: string;
    targetDate?: string;
    priority?: string;
  }) {
    return productivityRepository.createGoal({
      userId,
      title: input.title,
      description: input.description,
      category: input.category,
      targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
      priority: input.priority,
    });
  },

  async updateGoal(userId: string, goalId: string, input: Record<string, unknown>) {
    const goal = await productivityRepository.findGoal(userId, goalId);
    if (!goal) throw ApiError.notFound('Goal not found');
    return productivityRepository.updateGoal(goalId, input as any);
  },

  async deleteGoal(userId: string, goalId: string) {
    const goal = await productivityRepository.findGoal(userId, goalId);
    if (!goal) throw ApiError.notFound('Goal not found');
    await productivityRepository.deleteGoal(goalId);
  },

  async addMilestone(userId: string, goalId: string, title: string) {
    const goal = await productivityRepository.findGoal(userId, goalId);
    if (!goal) throw ApiError.notFound('Goal not found');
    return productivityRepository.addMilestone(goalId, title, goal.milestones.length);
  },

  async toggleMilestone(userId: string, goalId: string, milestoneId: string, completed: boolean) {
    const goal = await productivityRepository.findGoal(userId, goalId);
    if (!goal) throw ApiError.notFound('Goal not found');
    if (!goal.milestones.some((m) => m.id === milestoneId)) throw ApiError.notFound('Milestone not found');
    return productivityRepository.toggleMilestone(milestoneId, completed);
  },

  // ---- Roadmaps ----
  listRoadmaps(userId: string) {
    return productivityRepository.listRoadmaps(userId);
  },

  listRoadmapTemplates() {
    return productivityRepository.listRoadmapTemplates();
  },

  createRoadmap(userId: string, input: { title: string; careerPath?: string }) {
    return productivityRepository.createRoadmap({ userId, ...input });
  },

  async cloneTemplate(userId: string, templateId: string) {
    const roadmap = await productivityRepository.cloneTemplate(userId, templateId);
    if (!roadmap) throw ApiError.notFound('Roadmap template not found');
    return roadmap;
  },

  async addRoadmapMilestone(userId: string, roadmapId: string, title: string, deadline?: string) {
    const roadmaps = await productivityRepository.listRoadmaps(userId);
    const roadmap = roadmaps.find((r) => r.id === roadmapId);
    if (!roadmap) throw ApiError.notFound('Roadmap not found');
    return productivityRepository.addRoadmapMilestone(
      roadmapId,
      title,
      roadmap.milestones.length,
      deadline ? new Date(deadline) : undefined,
    );
  },

  async toggleRoadmapMilestone(userId: string, roadmapId: string, milestoneId: string, completed: boolean) {
    const roadmaps = await productivityRepository.listRoadmaps(userId);
    const roadmap = roadmaps.find((r) => r.id === roadmapId);
    if (!roadmap || !roadmap.milestones.some((m) => m.id === milestoneId)) {
      throw ApiError.notFound('Roadmap milestone not found');
    }
    return productivityRepository.toggleRoadmapMilestone(milestoneId, completed);
  },

  async deleteRoadmap(userId: string, roadmapId: string) {
    const roadmaps = await productivityRepository.listRoadmaps(userId);
    if (!roadmaps.some((r) => r.id === roadmapId)) throw ApiError.notFound('Roadmap not found');
    await productivityRepository.deleteRoadmap(roadmapId);
  },

  // ---- Tasks ----
  listTasks(userId: string) {
    return productivityRepository.listTasks(userId);
  },

  createTask(
    userId: string,
    input: {
      title: string;
      description?: string;
      category?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      deadline?: string;
      goalId?: string;
    },
  ) {
    return productivityRepository.createTask({
      userId,
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
      goalId: input.goalId,
    });
  },

  async setTaskCompleted(userId: string, taskId: string, completed: boolean) {
    const task = await productivityRepository.findTask(userId, taskId);
    if (!task) throw ApiError.notFound('Task not found');
    return productivityRepository.updateTask(taskId, { completedAt: completed ? new Date() : null });
  },

  async updateTask(userId: string, taskId: string, input: Record<string, unknown>) {
    const task = await productivityRepository.findTask(userId, taskId);
    if (!task) throw ApiError.notFound('Task not found');
    return productivityRepository.updateTask(taskId, input as any);
  },

  async deleteTask(userId: string, taskId: string) {
    const task = await productivityRepository.findTask(userId, taskId);
    if (!task) throw ApiError.notFound('Task not found');
    await productivityRepository.deleteTask(taskId);
  },
};

import { prisma } from '@database/prisma';

export const productivityRepository = {
  // ---- Goals ----
  listGoals(userId: string) {
    return prisma.goal.findMany({
      where: { userId },
      include: { milestones: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  findGoal(userId: string, goalId: string) {
    return prisma.goal.findFirst({
      where: { id: goalId, userId },
      include: { milestones: { orderBy: { order: 'asc' } } },
    });
  },

  createGoal(data: {
    userId: string;
    title: string;
    description?: string;
    category?: string;
    targetDate?: Date;
    priority?: string;
  }) {
    return prisma.goal.create({ data });
  },

  updateGoal(
    goalId: string,
    data: Partial<{
      title: string;
      description: string;
      category: string;
      targetDate: Date;
      priority: string;
      status: 'NOT_STARTED' | 'IN_PROGRESS' | 'AT_RISK' | 'COMPLETED' | 'PAUSED';
    }>,
  ) {
    return prisma.goal.update({ where: { id: goalId }, data });
  },

  deleteGoal(goalId: string) {
    return prisma.goal.delete({ where: { id: goalId } });
  },

  addMilestone(goalId: string, title: string, order: number) {
    return prisma.goalMilestone.create({ data: { goalId, title, order } });
  },

  toggleMilestone(milestoneId: string, completed: boolean) {
    return prisma.goalMilestone.update({
      where: { id: milestoneId },
      data: { completedAt: completed ? new Date() : null },
    });
  },

  // ---- Roadmaps ----
  listRoadmaps(userId: string) {
    return prisma.roadmap.findMany({
      where: { userId },
      include: { milestones: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  listRoadmapTemplates() {
    return prisma.roadmap.findMany({
      where: { isTemplate: true },
      include: { milestones: { orderBy: { order: 'asc' } } },
    });
  },

  createRoadmap(data: { userId: string; title: string; careerPath?: string }) {
    return prisma.roadmap.create({ data });
  },

  cloneTemplate(userId: string, templateId: string) {
    return prisma.$transaction(async (tx) => {
      const template = await tx.roadmap.findUnique({
        where: { id: templateId },
        include: { milestones: { orderBy: { order: 'asc' } } },
      });
      if (!template) return null;

      return tx.roadmap.create({
        data: {
          userId,
          title: template.title,
          careerPath: template.careerPath,
          milestones: {
            create: template.milestones.map((m) => ({ title: m.title, order: m.order })),
          },
        },
        include: { milestones: true },
      });
    });
  },

  addRoadmapMilestone(roadmapId: string, title: string, order: number, deadline?: Date) {
    return prisma.roadmapMilestone.create({ data: { roadmapId, title, order, deadline } });
  },

  toggleRoadmapMilestone(milestoneId: string, completed: boolean) {
    return prisma.roadmapMilestone.update({
      where: { id: milestoneId },
      data: { completedAt: completed ? new Date() : null },
    });
  },

  reorderRoadmapMilestone(milestoneId: string, order: number) {
    return prisma.roadmapMilestone.update({ where: { id: milestoneId }, data: { order } });
  },

  deleteRoadmap(roadmapId: string) {
    return prisma.roadmap.delete({ where: { id: roadmapId } });
  },

  // ---- Tasks ----
  listTasks(userId: string) {
    return prisma.task.findMany({
      where: { userId },
      orderBy: [{ completedAt: 'asc' }, { deadline: 'asc' }],
    });
  },

  createTask(data: {
    userId: string;
    title: string;
    description?: string;
    category?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    deadline?: Date;
    goalId?: string;
  }) {
    return prisma.task.create({ data });
  },

  updateTask(
    taskId: string,
    data: Partial<{
      title: string;
      description: string;
      category: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      deadline: Date | null;
      completedAt: Date | null;
    }>,
  ) {
    return prisma.task.update({ where: { id: taskId }, data });
  },

  findTask(userId: string, taskId: string) {
    return prisma.task.findFirst({ where: { id: taskId, userId } });
  },

  deleteTask(taskId: string) {
    return prisma.task.delete({ where: { id: taskId } });
  },

  listOverdueTasks(userId: string) {
    return prisma.task.findMany({
      where: { userId, completedAt: null, deadline: { lt: new Date() } },
    });
  },
};

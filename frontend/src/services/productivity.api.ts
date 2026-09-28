import { api } from './api';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'AT_RISK' | 'COMPLETED' | 'PAUSED';

export interface GoalMilestone {
  id: string;
  title: string;
  order: number;
  completedAt: string | null;
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  targetDate: string | null;
  priority: string | null;
  status: GoalStatus;
  milestones: GoalMilestone[];
  progressPercent: number;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  order: number;
  deadline: string | null;
  completedAt: string | null;
}

export interface Roadmap {
  id: string;
  title: string;
  careerPath: string | null;
  isTemplate: boolean;
  milestones: RoadmapMilestone[];
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: TaskPriority;
  deadline: string | null;
  completedAt: string | null;
  goalId: string | null;
}

export const productivityApi = {
  // Goals
  listGoals: () => api.get<{ data: Goal[] }>('/productivity/goals'),
  createGoal: (input: { title: string; description?: string; category?: string; targetDate?: string; priority?: string }) =>
    api.post<{ data: Goal }>('/productivity/goals', input),
  updateGoal: (goalId: string, input: Partial<{ status: GoalStatus }>) =>
    api.patch(`/productivity/goals/${goalId}`, input),
  deleteGoal: (goalId: string) => api.delete(`/productivity/goals/${goalId}`),
  addMilestone: (goalId: string, title: string) =>
    api.post(`/productivity/goals/${goalId}/milestones`, { title }),
  toggleMilestone: (goalId: string, milestoneId: string, completed: boolean) =>
    api.patch(`/productivity/goals/${goalId}/milestones/${milestoneId}`, { completed }),

  // Roadmaps
  listRoadmaps: () => api.get<{ data: Roadmap[] }>('/productivity/roadmaps'),
  listRoadmapTemplates: () => api.get<{ data: Roadmap[] }>('/productivity/roadmaps/templates'),
  createRoadmap: (input: { title: string; careerPath?: string }) =>
    api.post<{ data: Roadmap }>('/productivity/roadmaps', input),
  cloneTemplate: (templateId: string) =>
    api.post<{ data: Roadmap }>(`/productivity/roadmaps/templates/${templateId}/clone`, {}),
  addRoadmapMilestone: (roadmapId: string, title: string, deadline?: string) =>
    api.post(`/productivity/roadmaps/${roadmapId}/milestones`, { title, deadline }),
  toggleRoadmapMilestone: (roadmapId: string, milestoneId: string, completed: boolean) =>
    api.patch(`/productivity/roadmaps/${roadmapId}/milestones/${milestoneId}`, { completed }),
  deleteRoadmap: (roadmapId: string) => api.delete(`/productivity/roadmaps/${roadmapId}`),

  // Tasks
  listTasks: () => api.get<{ data: Task[] }>('/productivity/tasks'),
  createTask: (input: {
    title: string;
    description?: string;
    category?: string;
    priority?: TaskPriority;
    deadline?: string;
    goalId?: string;
  }) => api.post<{ data: Task }>('/productivity/tasks', input),
  setTaskCompleted: (taskId: string, completed: boolean) =>
    api.patch(`/productivity/tasks/${taskId}/completion`, { completed }),
  deleteTask: (taskId: string) => api.delete(`/productivity/tasks/${taskId}`),
};

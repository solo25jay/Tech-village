import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { RoleName } from '@/types/user';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/verify/:code',
      name: 'verify-certificate',
      component: () => import('@/views/public/VerifyCertificateView.vue'),
    },
    {
      path: '/',
      component: () => import('@/layouts/AuthLayout.vue'),
      meta: { guestOnly: true },
      children: [
        { path: 'login', name: 'login', component: () => import('@/views/auth/LoginView.vue') },
        { path: 'register', name: 'register', component: () => import('@/views/auth/RegisterView.vue') },
      ],
    },
    {
      path: '/app',
      component: () => import('@/layouts/LearnerLayout.vue'),
      meta: { requiresAuth: true, roles: ['learner', 'professional', 'mentor', 'admin', 'super_admin'] as RoleName[] },
      children: [
        { path: 'dashboard', name: 'learner-dashboard', component: () => import('@/views/learner/DashboardView.vue') },
        { path: 'learning-paths', component: () => import('@/views/learner/LearningPathsView.vue') },
        { path: 'courses', component: () => import('@/views/learner/CoursesView.vue') },
        { path: 'courses/:courseId', component: () => import('@/views/learner/CourseDetailView.vue') },
        { path: 'goals', component: () => import('@/views/learner/GoalsView.vue') },
        { path: 'roadmap', component: () => import('@/views/learner/RoadmapView.vue') },
        { path: 'tasks', component: () => import('@/views/learner/TasksView.vue') },
        { path: 'mentorship', component: () => import('@/views/learner/MentorshipView.vue') },
        { path: 'calendar', component: () => import('@/views/learner/CalendarView.vue') },
        { path: 'projects', component: () => import('@/views/learner/ProjectsView.vue') },
        { path: 'certificates', component: () => import('@/views/learner/CertificatesView.vue') },
        { path: 'jobs', component: () => import('@/views/learner/JobsView.vue') },
        { path: 'community', component: () => import('@/views/learner/CommunityView.vue') },
      ],
    },
    {
      path: '/mentor',
      component: () => import('@/layouts/MentorLayout.vue'),
      meta: { requiresAuth: true, roles: ['mentor', 'admin', 'super_admin'] as RoleName[] },
      children: [
        { path: 'dashboard', name: 'mentor-dashboard', component: () => import('@/views/mentor/DashboardView.vue') },
        { path: 'mentees', component: () => import('@/views/mentor/MenteesView.vue') },
        { path: 'sessions', component: () => import('@/views/mentor/SessionsView.vue') },
        { path: 'events', component: () => import('@/views/mentor/EventsView.vue') },
        { path: 'messages', component: () => import('@/views/mentor/MessagesView.vue') },
        { path: 'earnings', component: () => import('@/views/mentor/EarningsView.vue') },
        { path: 'reviews', component: () => import('@/views/mentor/ReviewsView.vue') },
      ],
    },
    {
      path: '/company',
      component: () => import('@/layouts/CompanyLayout.vue'),
      meta: { requiresAuth: true, roles: ['company', 'admin', 'super_admin'] as RoleName[] },
      children: [
        { path: 'profile', name: 'company-profile', component: () => import('@/views/company/ProfileView.vue') },
        { path: 'jobs', component: () => import('@/views/company/JobsView.vue') },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'super_admin'] as RoleName[] },
      children: [
        { path: 'dashboard', name: 'admin-dashboard', component: () => import('@/views/admin/DashboardView.vue') },
        { path: 'users', component: () => import('@/views/admin/UsersView.vue') },
        { path: 'learning-paths', component: () => import('@/views/admin/LearningPathsView.vue') },
        { path: 'courses', component: () => import('@/views/admin/CoursesView.vue') },
        { path: 'courses/:id', component: () => import('@/views/admin/CourseDetailView.vue') },
        { path: 'mentors', component: () => import('@/views/admin/MentorsView.vue') },
        { path: 'events', component: () => import('@/views/admin/EventsView.vue') },
        { path: 'community-access', component: () => import('@/views/admin/CommunityAccessView.vue') },
        { path: 'certificates', component: () => import('@/views/admin/CertificatesView.vue') },
        { path: 'jobs', component: () => import('@/views/admin/JobsView.vue') },
        { path: 'emails', component: () => import('@/views/admin/EmailsView.vue') },
        { path: 'payments', component: () => import('@/views/admin/PaymentsView.vue') },
        { path: 'reports', component: () => import('@/views/admin/ReportsView.vue') },
        { path: 'audit-logs', component: () => import('@/views/admin/AuditLogsView.vue') },
        { path: 'settings', component: () => import('@/views/admin/SettingsView.vue') },
      ],
    },
  ],
});

export function homeFor(role: RoleName | null): string {
  switch (role) {
    case 'company':
      return '/company/profile';
    case 'mentor':
      return '/mentor/dashboard';
    case 'admin':
    case 'super_admin':
      return '/admin/dashboard';
    default:
      return '/app/dashboard';
  }
}

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { path: homeFor(auth.primaryRole) };
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: '/login' };
  }

  const allowedRoles = to.meta.roles as RoleName[] | undefined;
  if (allowedRoles && !auth.hasRole(...allowedRoles)) {
    return { path: homeFor(auth.primaryRole) };
  }

  return true;
});

export default router;

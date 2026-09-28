<script setup lang="ts">
import AppShell from './AppShell.vue';
import type { NavItem } from '@/types/nav';

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/app/dashboard' },
  { label: 'Learning Paths', to: '/app/learning-paths' },
  { label: 'Courses', to: '/app/courses' },
  { label: 'Goals', to: '/app/goals' },
  { label: 'Roadmap', to: '/app/roadmap' },
  { label: 'Tasks', to: '/app/tasks' },
  { label: 'Mentorship', to: '/app/mentorship' },
  { label: 'Calendar', to: '/app/calendar' },
  { label: 'Projects', to: '/app/projects' },
  { label: 'Certificates', to: '/app/certificates' },
  { label: 'Jobs', to: '/app/jobs' },
  { label: 'Community', to: '/app/community' },
];
</script>

<template>
  <AppShell :nav-items="navItems" portal-label="Learner Portal" />
</template>

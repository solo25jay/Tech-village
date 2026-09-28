<script setup lang="ts">
import AppShell from './AppShell.vue';
import type { NavItem } from '@/types/nav';

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Learning Paths', to: '/admin/learning-paths' },
  { label: 'Courses', to: '/admin/courses' },
  { label: 'Mentors', to: '/admin/mentors' },
  { label: 'Events', to: '/admin/events' },
  { label: 'Community Access', to: '/admin/community-access' },
  { label: 'Certificates', to: '/admin/certificates' },
  { label: 'Jobs', to: '/admin/jobs' },
  { label: 'Emails', to: '/admin/emails' },
  { label: 'Payments', to: '/admin/payments' },
  { label: 'Reports', to: '/admin/reports' },
  { label: 'Audit Logs', to: '/admin/audit-logs' },
  { label: 'Settings', to: '/admin/settings' },
];
</script>

<template>
  <AppShell :nav-items="navItems" portal-label="Admin Portal" />
</template>

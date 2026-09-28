<script setup lang="ts">
import AppShell from '@/layouts/AppShell.vue';
import type { NavItem } from '@/types/nav';

const navItems: NavItem[] = [
  { label: 'Company profile', to: '/company/profile' },
  { label: 'Jobs', to: '/company/jobs' },
];
</script>

<template>
  <AppShell :nav-items="navItems" portal-label="Company Portal" />
</template>

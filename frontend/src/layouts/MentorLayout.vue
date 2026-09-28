<script setup lang="ts">
import AppShell from './AppShell.vue';
import type { NavItem } from '@/types/nav';

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/mentor/dashboard' },
  { label: 'Mentees', to: '/mentor/mentees' },
  { label: 'Sessions', to: '/mentor/sessions' },
  { label: 'Events', to: '/mentor/events' },
  { label: 'Messages', to: '/mentor/messages' },
  { label: 'Earnings', to: '/mentor/earnings' },
  { label: 'Reviews', to: '/mentor/reviews' },
];
</script>

<template>
  <AppShell :nav-items="navItems" portal-label="Mentor Portal" />
</template>

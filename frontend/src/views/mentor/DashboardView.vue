<script setup lang="ts">
// Placeholder data — wired to the mentorship module's API in Phase 2.
const stats = { totalMentees: 2, activeMentees: 1, upcomingSessions: 4, pendingRequests: 3 };
const upcomingSessions = [
  { mentee: 'Chidi A.', when: 'Today, 3:00 PM', topic: 'Career roadmap review' },
  { mentee: 'Ngozi E.', when: 'Tomorrow, 10:00 AM', topic: 'React project feedback' },
];
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Mentor dashboard</h1>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="tv-card text-center">
        <div class="text-2xl font-bold text-electric">{{ stats.totalMentees }}</div>
        <div class="text-xs text-slate-500 mt-1">Total mentees</div>
      </div>
      <div class="tv-card text-center">
        <div class="text-2xl font-bold text-teal">{{ stats.activeMentees }}</div>
        <div class="text-xs text-slate-500 mt-1">Active mentees</div>
      </div>
      <div class="tv-card text-center">
        <div class="text-2xl font-bold text-indigo">{{ stats.upcomingSessions }}</div>
        <div class="text-xs text-slate-500 mt-1">Upcoming sessions</div>
      </div>
      <div class="tv-card text-center">
        <div class="text-2xl font-bold text-green">{{ stats.pendingRequests }}</div>
        <div class="text-xs text-slate-500 mt-1">Pending requests</div>
      </div>
    </div>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">Upcoming sessions</h2>
      <ul class="divide-y divide-slate-100">
        <li v-for="s in upcomingSessions" :key="s.mentee" class="py-3 flex items-center justify-between text-sm">
          <div>
            <div class="text-slate-700 font-medium">{{ s.mentee }}</div>
            <div class="text-slate-500 text-xs">{{ s.topic }}</div>
          </div>
          <span class="text-slate-400 text-xs">{{ s.when }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
});

// Placeholder data — wired to real endpoints in Phase 1 (goals, tasks,
// courses, mentorship modules) once those routers are built.
const continueLearning = {
  courseTitle: 'Frontend Development — Module 3: Vue Fundamentals',
  progressPercent: 62,
};
const goals = [
  { title: 'Become a Full Stack Developer', progressPercent: 40, deadline: 'Dec 2026' },
  { title: 'Complete Python in 60 days', progressPercent: 15, deadline: 'Oct 2026' },
];
const todaysTasks = [
  { title: 'Finish Vue Router lesson', priority: 'HIGH', done: false },
  { title: 'Submit assignment: To-do app', priority: 'MEDIUM', done: false },
  { title: 'Review JavaScript quiz results', priority: 'LOW', done: true },
];
const upcoming = [
  { label: 'Mentorship with Ada O.', when: 'Today, 4:00 PM' },
  { label: 'Webinar: Intro to Cloud Engineering', when: 'Thu, 6:00 PM' },
];
const progress = { coursesCompleted: 3, projectsCompleted: 2, certificates: 1, streakDays: 12 };
</script>

<template>
  <div class="space-y-6">
    <!-- WELCOME -->
    <div>
      <h1 class="text-xl font-semibold text-navy">{{ greeting }}, {{ auth.user?.firstName }}.</h1>
      <p class="text-sm text-slate-500">Keep going. You're making progress.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- CONTINUE LEARNING -->
      <div class="tv-card lg:col-span-2">
        <h2 class="font-semibold text-navy mb-3">Continue learning</h2>
        <p class="text-sm text-slate-600">{{ continueLearning.courseTitle }}</p>
        <div class="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            class="h-full bg-gradient-blue-cyan"
            :style="{ width: continueLearning.progressPercent + '%' }"
          />
        </div>
        <div class="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>{{ continueLearning.progressPercent }}% complete</span>
          <button class="tv-btn-primary !px-3 !py-1.5 text-xs">Resume</button>
        </div>
      </div>

      <!-- PROGRESS -->
      <div class="tv-card">
        <h2 class="font-semibold text-navy mb-3">Progress</h2>
        <div class="grid grid-cols-2 gap-3 text-center">
          <div>
            <div class="text-xl font-bold text-electric">{{ progress.coursesCompleted }}</div>
            <div class="text-xs text-slate-500">Courses</div>
          </div>
          <div>
            <div class="text-xl font-bold text-teal">{{ progress.projectsCompleted }}</div>
            <div class="text-xs text-slate-500">Projects</div>
          </div>
          <div>
            <div class="text-xl font-bold text-indigo">{{ progress.certificates }}</div>
            <div class="text-xs text-slate-500">Certificates</div>
          </div>
          <div>
            <div class="text-xl font-bold text-green">{{ progress.streakDays }}d</div>
            <div class="text-xs text-slate-500">Streak</div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- GOALS -->
      <div class="tv-card">
        <h2 class="font-semibold text-navy mb-3">Goals</h2>
        <div v-for="goal in goals" :key="goal.title" class="mb-3 last:mb-0">
          <div class="flex justify-between text-sm">
            <span class="text-slate-700">{{ goal.title }}</span>
            <span class="text-slate-400 text-xs">{{ goal.deadline }}</span>
          </div>
          <div class="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div class="h-full bg-gradient-purple-blue" :style="{ width: goal.progressPercent + '%' }" />
          </div>
        </div>
      </div>

      <!-- TODAY'S TASKS -->
      <div class="tv-card">
        <h2 class="font-semibold text-navy mb-3">Today's tasks</h2>
        <ul class="space-y-2">
          <li v-for="task in todaysTasks" :key="task.title" class="flex items-center gap-2 text-sm">
            <input type="checkbox" :checked="task.done" class="accent-electric" readonly />
            <span :class="task.done ? 'line-through text-slate-400' : 'text-slate-700'">{{ task.title }}</span>
            <span
              class="tv-badge ml-auto"
              :class="{
                'bg-red-50 text-red-600': task.priority === 'HIGH',
                'bg-amber-50 text-amber-600': task.priority === 'MEDIUM',
                'bg-slate-100 text-slate-500': task.priority === 'LOW',
              }"
              >{{ task.priority }}</span
            >
          </li>
        </ul>
      </div>

      <!-- UPCOMING -->
      <div class="tv-card">
        <h2 class="font-semibold text-navy mb-3">Upcoming</h2>
        <ul class="space-y-3">
          <li v-for="item in upcoming" :key="item.label" class="text-sm">
            <div class="text-slate-700">{{ item.label }}</div>
            <div class="text-xs text-slate-400">{{ item.when }}</div>
          </li>
        </ul>
      </div>
    </div>

    <!-- COMMUNITY -->
    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">Community</h2>
      <div class="flex items-center justify-between">
        <div>
          <span class="tv-badge bg-gradient-cyan-teal text-white">General Member</span>
          <p class="text-sm text-slate-500 mt-2">You're eligible for the Tech Village General Discord.</p>
        </div>
        <button class="tv-btn-secondary">Join Discord</button>
      </div>
    </div>
  </div>
</template>
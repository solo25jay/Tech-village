<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { productivityApi, type Goal, type GoalStatus } from '@/services/productivity.api';

const goals = ref<Goal[]>([]);
const loading = ref(true);
const error = ref('');
const creating = ref(false);
const newMilestoneTitle = reactive<Record<string, string>>({});

const form = reactive({ title: '', description: '', category: '', targetDate: '', priority: 'MEDIUM' });

const statusStyles: Record<GoalStatus, string> = {
  NOT_STARTED: 'bg-slate-100 text-slate-500',
  IN_PROGRESS: 'bg-blue-50 text-electric',
  AT_RISK: 'bg-amber-50 text-amber-600',
  COMPLETED: 'bg-green-50 text-green-600',
  PAUSED: 'bg-slate-100 text-slate-500',
};

async function load() {
  loading.value = true;
  try {
    const { data } = await productivityApi.listGoals();
    goals.value = data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load goals';
  } finally {
    loading.value = false;
  }
}

async function createGoal() {
  creating.value = true;
  try {
    await productivityApi.createGoal({
      title: form.title,
      description: form.description || undefined,
      category: form.category || undefined,
      targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : undefined,
      priority: form.priority,
    });
    form.title = '';
    form.description = '';
    form.category = '';
    form.targetDate = '';
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to create goal';
  } finally {
    creating.value = false;
  }
}

async function setStatus(goal: Goal, status: GoalStatus) {
  await productivityApi.updateGoal(goal.id, { status });
  await load();
}

async function addMilestone(goal: Goal) {
  const title = newMilestoneTitle[goal.id]?.trim();
  if (!title) return;
  await productivityApi.addMilestone(goal.id, title);
  newMilestoneTitle[goal.id] = '';
  await load();
}

async function toggleMilestone(goal: Goal, milestoneId: string, currentlyCompleted: boolean) {
  await productivityApi.toggleMilestone(goal.id, milestoneId, !currentlyCompleted);
  await load();
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Goals</h1>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">Set a new goal</h2>
      <form class="grid grid-cols-1 md:grid-cols-2 gap-3" @submit.prevent="createGoal">
        <input v-model="form.title" required placeholder="e.g. Become a Full Stack Developer" class="tv-input md:col-span-2" />
        <input v-model="form.category" placeholder="Category (optional)" class="tv-input" />
        <input v-model="form.targetDate" type="date" class="tv-input" />
        <select v-model="form.priority" class="tv-input">
          <option value="LOW">Low priority</option>
          <option value="MEDIUM">Medium priority</option>
          <option value="HIGH">High priority</option>
          <option value="CRITICAL">Critical</option>
        </select>
        <textarea v-model="form.description" placeholder="Description (optional)" rows="2" class="tv-input md:col-span-2" />
        <button type="submit" class="tv-btn-primary md:col-span-2" :disabled="creating">
          {{ creating ? 'Creating…' : 'Set goal' }}
        </button>
      </form>
      <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>
    </div>

    <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
    <p v-else-if="goals.length === 0" class="text-sm text-slate-500">No goals yet — set one above.</p>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div v-for="goal in goals" :key="goal.id" class="tv-card">
        <div class="flex items-start justify-between gap-2">
          <h2 class="font-semibold text-navy">{{ goal.title }}</h2>
          <select
            class="tv-badge border-0 text-xs"
            :class="statusStyles[goal.status]"
            :value="goal.status"
            @change="setStatus(goal, ($event.target as HTMLSelectElement).value as GoalStatus)"
          >
            <option value="NOT_STARTED">Not started</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="AT_RISK">At risk</option>
            <option value="COMPLETED">Completed</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>
        <p v-if="goal.description" class="text-sm text-slate-500 mt-1">{{ goal.description }}</p>
        <p v-if="goal.targetDate" class="text-xs text-slate-400 mt-1">
          Target: {{ new Date(goal.targetDate).toLocaleDateString() }}
        </p>

        <div class="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div class="h-full bg-gradient-purple-blue" :style="{ width: goal.progressPercent + '%' }" />
        </div>

        <ul class="mt-3 space-y-1.5">
          <li v-for="m in goal.milestones" :key="m.id" class="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              class="accent-electric"
              :checked="Boolean(m.completedAt)"
              @change="toggleMilestone(goal, m.id, Boolean(m.completedAt))"
            />
            <span :class="m.completedAt ? 'line-through text-slate-400' : 'text-slate-700'">{{ m.title }}</span>
          </li>
        </ul>

        <form class="mt-3 flex gap-2" @submit.prevent="addMilestone(goal)">
          <input v-model="newMilestoneTitle[goal.id]" placeholder="Add a milestone" class="tv-input text-sm flex-1" />
          <button type="submit" class="tv-btn-secondary text-sm !px-3">Add</button>
        </form>
      </div>
    </div>
  </div>
</template>
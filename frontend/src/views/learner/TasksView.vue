<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { productivityApi, type Task, type TaskPriority } from '@/services/productivity.api';

const tasks = ref<Task[]>([]);
const loading = ref(true);
const error = ref('');
const creating = ref(false);
const activeView = ref<'today' | 'upcoming' | 'completed' | 'all'>('today');

const form = reactive({ title: '', priority: 'MEDIUM' as TaskPriority, deadline: '' });

const priorityStyles: Record<TaskPriority, string> = {
  LOW: 'bg-slate-100 text-slate-500',
  MEDIUM: 'bg-amber-50 text-amber-600',
  HIGH: 'bg-orange-50 text-orange-600',
  CRITICAL: 'bg-red-50 text-red-600',
};

function isToday(dateStr: string | null) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

const filtered = computed(() => {
  if (activeView.value === 'completed') return tasks.value.filter((t) => t.completedAt);
  if (activeView.value === 'all') return tasks.value;
  const incomplete = tasks.value.filter((t) => !t.completedAt);
  if (activeView.value === 'today') return incomplete.filter((t) => !t.deadline || isToday(t.deadline));
  // upcoming: has a deadline in the future, not today
  return incomplete.filter((t) => t.deadline && !isToday(t.deadline) && new Date(t.deadline) > new Date());
});

async function load() {
  loading.value = true;
  try {
    const { data } = await productivityApi.listTasks();
    tasks.value = data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load tasks';
  } finally {
    loading.value = false;
  }
}

async function createTask() {
  creating.value = true;
  try {
    await productivityApi.createTask({
      title: form.title,
      priority: form.priority,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
    });
    form.title = '';
    form.deadline = '';
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to create task';
  } finally {
    creating.value = false;
  }
}

async function toggleComplete(task: Task) {
  await productivityApi.setTaskCompleted(task.id, !task.completedAt);
  await load();
}

async function removeTask(task: Task) {
  await productivityApi.deleteTask(task.id);
  await load();
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Tasks</h1>

    <div class="tv-card">
      <form class="grid grid-cols-1 md:grid-cols-4 gap-3" @submit.prevent="createTask">
        <input v-model="form.title" required placeholder="New task" class="tv-input md:col-span-2" />
        <input v-model="form.deadline" type="date" class="tv-input" />
        <select v-model="form.priority" class="tv-input">
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
        <button type="submit" class="tv-btn-primary md:col-span-4" :disabled="creating">
          {{ creating ? 'Adding…' : '+ Add task' }}
        </button>
      </form>
      <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>
    </div>

    <div class="flex gap-2">
      <button
        v-for="view in (['today', 'upcoming', 'completed', 'all'] as const)"
        :key="view"
        class="tv-badge capitalize cursor-pointer"
        :class="activeView === view ? 'bg-gradient-blue-cyan text-white' : 'bg-surface-light text-slate-500 border border-slate-200'"
        @click="activeView = view"
      >
        {{ view }}
      </button>
    </div>

    <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
    <p v-else-if="filtered.length === 0" class="text-sm text-slate-500">Nothing here.</p>

    <div v-else class="tv-card">
      <ul class="divide-y divide-slate-100">
        <li v-for="task in filtered" :key="task.id" class="py-3 flex items-center gap-3">
          <input type="checkbox" class="accent-electric" :checked="Boolean(task.completedAt)" @change="toggleComplete(task)" />
          <div class="flex-1">
            <div :class="task.completedAt ? 'line-through text-slate-400' : 'text-slate-700'" class="text-sm">
              {{ task.title }}
            </div>
            <div v-if="task.deadline" class="text-xs text-slate-400">
              Due {{ new Date(task.deadline).toLocaleDateString() }}
            </div>
          </div>
          <span class="tv-badge" :class="priorityStyles[task.priority]">{{ task.priority }}</span>
          <button class="text-slate-400 hover:text-red-500 text-xs" @click="removeTask(task)">Remove</button>
        </li>
      </ul>
    </div>
  </div>
</template>
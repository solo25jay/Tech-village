<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { adminLearningApi, type LearningPath } from '@/services/learning.api';

const paths = ref<LearningPath[]>([]);
const loading = ref(true);
const error = ref('');
const creating = ref(false);

const form = reactive({
  name: '',
  description: '',
  difficulty: 'BEGINNER',
  durationWeeks: undefined as number | undefined,
  skillsInput: '',
});

async function load() {
  loading.value = true;
  try {
    const { data } = await adminLearningApi.listPaths();
    paths.value = data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load learning paths';
  } finally {
    loading.value = false;
  }
}

async function createPath() {
  creating.value = true;
  error.value = '';
  try {
    await adminLearningApi.createPath({
      name: form.name,
      description: form.description,
      difficulty: form.difficulty,
      durationWeeks: form.durationWeeks,
      skills: form.skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    form.name = '';
    form.description = '';
    form.durationWeeks = undefined;
    form.skillsInput = '';
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to create learning path';
  } finally {
    creating.value = false;
  }
}

async function togglePublish(path: LearningPath) {
  await adminLearningApi.publishPath(path.id, !path.isPublished);
  await load();
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Learning paths</h1>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">Create a learning path</h2>
      <form class="grid grid-cols-1 md:grid-cols-2 gap-3" @submit.prevent="createPath">
        <input v-model="form.name" required placeholder="Name" class="tv-input" />
        <select v-model="form.difficulty" class="tv-input">
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
        <input
          v-model.number="form.durationWeeks"
          type="number"
          min="1"
          placeholder="Duration (weeks)"
          class="tv-input"
        />
        <input v-model="form.skillsInput" placeholder="Skills (comma separated)" class="tv-input" />
        <textarea
          v-model="form.description"
          required
          placeholder="Description"
          rows="2"
          class="tv-input md:col-span-2"
        />
        <button type="submit" class="tv-btn-primary md:col-span-2" :disabled="creating">
          {{ creating ? 'Creating…' : 'Create learning path' }}
        </button>
      </form>
      <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>
    </div>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">All learning paths</h2>
      <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-400 border-b border-slate-100">
            <th class="py-2 font-medium">Name</th>
            <th class="py-2 font-medium">Difficulty</th>
            <th class="py-2 font-medium">Courses</th>
            <th class="py-2 font-medium">Status</th>
            <th class="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="path in paths" :key="path.id" class="border-b border-slate-50">
            <td class="py-2">{{ path.name }}</td>
            <td class="py-2">{{ path.difficulty }}</td>
            <td class="py-2">{{ path.courses.length }}</td>
            <td class="py-2">
              <span
                class="tv-badge"
                :class="path.isPublished ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'"
              >
                {{ path.isPublished ? 'Published' : 'Draft' }}
              </span>
            </td>
            <td class="py-2">
              <button class="text-electric text-xs font-medium" @click="togglePublish(path)">
                {{ path.isPublished ? 'Unpublish' : 'Publish' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { learningApi, type LearningPath } from '@/services/learning.api';

const paths = ref<LearningPath[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const { data } = await learningApi.listPaths();
    paths.value = data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load learning paths';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-semibold text-navy">Learning paths</h1>

    <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
    <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-else-if="paths.length === 0" class="text-sm text-slate-500">
      No learning paths published yet.
    </p>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="path in paths" :key="path.id" class="tv-card">
        <div class="flex items-start justify-between">
          <h2 class="font-semibold text-navy">{{ path.name }}</h2>
          <span class="tv-badge bg-gradient-blue-cyan text-white">{{ path.difficulty }}</span>
        </div>
        <p class="text-sm text-slate-500 mt-2 line-clamp-3">{{ path.description }}</p>
        <div class="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span v-if="path.durationWeeks">{{ path.durationWeeks }} weeks</span>
          <span>{{ path.courses.length }} course{{ path.courses.length === 1 ? '' : 's' }}</span>
        </div>
        <div v-if="path.skills?.length" class="mt-3 flex flex-wrap gap-1.5">
          <span
            v-for="skill in path.skills"
            :key="skill"
            class="tv-badge bg-surface-light text-navy border border-slate-200"
          >
            {{ skill }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
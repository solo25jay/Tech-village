<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { productivityApi, type Roadmap } from '@/services/productivity.api';

const roadmaps = ref<Roadmap[]>([]);
const templates = ref<Roadmap[]>([]);
const loading = ref(true);
const error = ref('');
const creating = ref(false);
const newMilestoneTitle = reactive<Record<string, string>>({});

const form = reactive({ title: '', careerPath: '' });

async function load() {
  loading.value = true;
  try {
    const [mine, tpl] = await Promise.all([productivityApi.listRoadmaps(), productivityApi.listRoadmapTemplates()]);
    roadmaps.value = mine.data.data;
    templates.value = tpl.data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load roadmaps';
  } finally {
    loading.value = false;
  }
}

async function createRoadmap() {
  creating.value = true;
  try {
    await productivityApi.createRoadmap({ title: form.title, careerPath: form.careerPath || undefined });
    form.title = '';
    form.careerPath = '';
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to create roadmap';
  } finally {
    creating.value = false;
  }
}

async function useTemplate(templateId: string) {
  await productivityApi.cloneTemplate(templateId);
  await load();
}

async function addMilestone(roadmap: Roadmap) {
  const title = newMilestoneTitle[roadmap.id]?.trim();
  if (!title) return;
  await productivityApi.addRoadmapMilestone(roadmap.id, title);
  newMilestoneTitle[roadmap.id] = '';
  await load();
}

async function toggleMilestone(roadmap: Roadmap, milestoneId: string, currentlyCompleted: boolean) {
  await productivityApi.toggleRoadmapMilestone(roadmap.id, milestoneId, !currentlyCompleted);
  await load();
}

async function removeRoadmap(roadmap: Roadmap) {
  await productivityApi.deleteRoadmap(roadmap.id);
  await load();
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Roadmap</h1>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">Build a custom roadmap</h2>
      <form class="grid grid-cols-1 md:grid-cols-2 gap-3" @submit.prevent="createRoadmap">
        <input v-model="form.title" required placeholder="Roadmap title" class="tv-input" />
        <input v-model="form.careerPath" placeholder="Career path (optional)" class="tv-input" />
        <button type="submit" class="tv-btn-primary md:col-span-2" :disabled="creating">
          {{ creating ? 'Creating…' : 'Create roadmap' }}
        </button>
      </form>
      <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>
    </div>

    <div v-if="templates.length" class="tv-card">
      <h2 class="font-semibold text-navy mb-3">Recommended roadmaps</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div v-for="tpl in templates" :key="tpl.id" class="rounded-lg border border-slate-200 p-3">
          <div class="text-sm font-medium text-navy">{{ tpl.title }}</div>
          <div class="text-xs text-slate-400 mt-0.5">{{ tpl.milestones.length }} milestones</div>
          <button class="tv-btn-secondary text-xs mt-2 w-full" @click="useTemplate(tpl.id)">Use this roadmap</button>
        </div>
      </div>
    </div>

    <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
    <p v-else-if="roadmaps.length === 0" class="text-sm text-slate-500">No roadmaps yet.</p>

    <div v-for="roadmap in roadmaps" :key="roadmap.id" class="tv-card">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="font-semibold text-navy">{{ roadmap.title }}</h2>
          <p v-if="roadmap.careerPath" class="text-xs text-electric">{{ roadmap.careerPath }}</p>
        </div>
        <button class="text-slate-400 hover:text-red-500 text-xs" @click="removeRoadmap(roadmap)">Delete</button>
      </div>

      <ol class="mt-4 relative border-l border-slate-200 pl-4 space-y-4">
        <li v-for="m in roadmap.milestones" :key="m.id" class="relative">
          <span
            class="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full"
            :class="m.completedAt ? 'bg-gradient-cyan-teal' : 'bg-slate-300'"
          />
          <label class="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              class="accent-electric"
              :checked="Boolean(m.completedAt)"
              @change="toggleMilestone(roadmap, m.id, Boolean(m.completedAt))"
            />
            <span :class="m.completedAt ? 'line-through text-slate-400' : 'text-slate-700'">{{ m.title }}</span>
          </label>
        </li>
      </ol>

      <form class="mt-3 flex gap-2" @submit.prevent="addMilestone(roadmap)">
        <input v-model="newMilestoneTitle[roadmap.id]" placeholder="Add a milestone" class="tv-input text-sm flex-1" />
        <button type="submit" class="tv-btn-secondary text-sm !px-3">Add</button>
      </form>
    </div>
  </div>
</template>
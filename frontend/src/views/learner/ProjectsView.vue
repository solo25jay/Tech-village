<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { credentialsApi, type Project } from '@/services/credentials.api';

const projects = ref<Project[]>([]);
const loading = ref(true);
const error = ref('');
const creating = ref(false);

const form = reactive({ name: '', description: '', category: '', technologiesInput: '', githubUrl: '', liveUrl: '' });

async function load() {
  loading.value = true;
  try {
    const { data } = await credentialsApi.listMyProjects();
    projects.value = data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load projects';
  } finally {
    loading.value = false;
  }
}

async function createProject() {
  creating.value = true;
  try {
    await credentialsApi.createProject({
      name: form.name,
      description: form.description || undefined,
      category: form.category || undefined,
      technologies: form.technologiesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      githubUrl: form.githubUrl || undefined,
      liveUrl: form.liveUrl || undefined,
    });
    form.name = '';
    form.description = '';
    form.category = '';
    form.technologiesInput = '';
    form.githubUrl = '';
    form.liveUrl = '';
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to create project';
  } finally {
    creating.value = false;
  }
}

async function markCompleted(project: Project) {
  await credentialsApi.markCompleted(project.id);
  await load();
}

async function removeProject(project: Project) {
  await credentialsApi.deleteProject(project.id);
  await load();
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Projects</h1>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">Add a project</h2>
      <form class="grid grid-cols-1 md:grid-cols-2 gap-3" @submit.prevent="createProject">
        <input v-model="form.name" required placeholder="Project name" class="tv-input" />
        <input v-model="form.category" placeholder="Category (optional)" class="tv-input" />
        <input v-model="form.technologiesInput" placeholder="Technologies (comma separated)" class="tv-input md:col-span-2" />
        <input v-model="form.githubUrl" placeholder="GitHub URL" class="tv-input" />
        <input v-model="form.liveUrl" placeholder="Live URL" class="tv-input" />
        <textarea v-model="form.description" placeholder="Description" rows="2" class="tv-input md:col-span-2" />
        <button type="submit" class="tv-btn-primary md:col-span-2" :disabled="creating">
          {{ creating ? 'Adding…' : 'Add project' }}
        </button>
      </form>
      <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>
    </div>

    <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
    <p v-else-if="projects.length === 0" class="text-sm text-slate-500">No projects yet — add your first above.</p>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="project in projects" :key="project.id" class="tv-card">
        <div class="flex items-start justify-between">
          <h2 class="font-semibold text-navy">{{ project.name }}</h2>
          <span v-if="project.completedAt" class="tv-badge bg-green-50 text-green-600">Completed</span>
        </div>
        <p v-if="project.description" class="text-sm text-slate-500 mt-1 line-clamp-2">{{ project.description }}</p>
        <div v-if="project.technologies?.length" class="mt-2 flex flex-wrap gap-1.5">
          <span
            v-for="t in project.technologies"
            :key="t"
            class="tv-badge bg-surface-light text-navy border border-slate-200"
            >{{ t }}</span
          >
        </div>
        <div class="mt-3 flex items-center gap-3 text-xs">
          <a v-if="project.githubUrl" :href="project.githubUrl" target="_blank" rel="noopener" class="text-electric">GitHub</a>
          <a v-if="project.liveUrl" :href="project.liveUrl" target="_blank" rel="noopener" class="text-electric">Live</a>
        </div>
        <div class="mt-3 flex items-center justify-between">
          <button v-if="!project.completedAt" class="text-xs text-electric font-medium" @click="markCompleted(project)">
            Mark completed
          </button>
          <span v-else></span>
          <button class="text-xs text-slate-400 hover:text-red-500" @click="removeProject(project)">Remove</button>
        </div>
      </div>
    </div>
  </div>
</template>
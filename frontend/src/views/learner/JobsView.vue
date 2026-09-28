<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { jobsApi, type JobListing, type MyApplication } from '@/services/jobs.api';

const jobs = ref<JobListing[]>([]);
const myApplications = ref<MyApplication[]>([]);
const loading = ref(true);
const error = ref('');
const applyingId = ref<string | null>(null);

const typeLabels: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
  FREELANCE: 'Freelance',
  APPRENTICESHIP: 'Apprenticeship',
  VOLUNTEER: 'Volunteer',
};

function hasApplied(jobId: string) {
  return myApplications.value.some((a) => a.job.id === jobId);
}

async function load() {
  loading.value = true;
  try {
    const [jobsRes, applicationsRes] = await Promise.all([jobsApi.listOpen(), jobsApi.myApplications()]);
    jobs.value = jobsRes.data.data;
    myApplications.value = applicationsRes.data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load jobs';
  } finally {
    loading.value = false;
  }
}

async function apply(jobId: string) {
  applyingId.value = jobId;
  try {
    await jobsApi.apply(jobId);
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to apply';
  } finally {
    applyingId.value = null;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Jobs & opportunities</h1>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div v-if="myApplications.length" class="tv-card">
      <h2 class="font-semibold text-navy mb-3">My applications</h2>
      <ul class="divide-y divide-slate-100">
        <li v-for="app in myApplications" :key="app.id" class="py-3 flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-navy">{{ app.job.title }}</div>
            <div class="text-xs text-slate-400">{{ app.job.company.name }}</div>
          </div>
          <span class="tv-badge bg-blue-50 text-electric">{{ app.status }}</span>
        </li>
      </ul>
    </div>

    <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
    <p v-else-if="jobs.length === 0" class="text-sm text-slate-500">No open opportunities right now.</p>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="job in jobs" :key="job.id" class="tv-card">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="font-semibold text-navy">{{ job.title }}</h2>
            <p class="text-xs text-slate-400 mt-0.5">{{ job.company.name }}</p>
          </div>
          <span class="tv-badge bg-gradient-purple-blue text-white">{{ typeLabels[job.type] }}</span>
        </div>
        <p class="text-sm text-slate-500 mt-2 line-clamp-2">{{ job.description }}</p>
        <div class="text-xs text-slate-400 mt-2">
          {{ job.remote ? 'Remote' : job.location ?? 'Location not specified' }}
        </div>
        <div v-if="job.skills?.length" class="mt-2 flex flex-wrap gap-1.5">
          <span v-for="s in job.skills" :key="s" class="tv-badge bg-surface-light text-navy border border-slate-200">{{
            s
          }}</span>
        </div>

        <button
          v-if="!hasApplied(job.id)"
          class="tv-btn-primary w-full mt-3 text-sm"
          :disabled="applyingId === job.id"
          @click="apply(job.id)"
        >
          {{ applyingId === job.id ? 'Applying…' : 'Apply' }}
        </button>
        <div v-else class="tv-btn-secondary w-full mt-3 text-sm text-center opacity-60">Applied</div>
      </div>
    </div>
  </div>
</template>
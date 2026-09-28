<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { companyApi, type ApplicationStatus, type JobApplicant, type JobListing, type JobType } from '@/services/jobs.api';

const jobs = ref<JobListing[]>([]);
const loading = ref(true);
const error = ref('');
const creating = ref(false);

const form = reactive({
  title: '',
  description: '',
  type: 'FULL_TIME' as JobType,
  location: '',
  remote: false,
  skillsInput: '',
});

const expandedJobId = ref<string | null>(null);
const applicantsByJob = reactive<Record<string, JobApplicant[]>>({});

async function load() {
  loading.value = true;
  try {
    const { data } = await companyApi.listMyJobs();
    jobs.value = data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load jobs — create a company profile first';
  } finally {
    loading.value = false;
  }
}

async function createJob() {
  creating.value = true;
  error.value = '';
  try {
    await companyApi.createJob({
      title: form.title,
      description: form.description,
      type: form.type,
      location: form.location || undefined,
      remote: form.remote,
      skills: form.skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    form.title = '';
    form.description = '';
    form.location = '';
    form.skillsInput = '';
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to create job';
  } finally {
    creating.value = false;
  }
}

async function togglePublish(job: JobListing) {
  await companyApi.publishJob(job.id, !job.isPublished);
  await load();
}

async function toggleApplicants(jobId: string) {
  if (expandedJobId.value === jobId) {
    expandedJobId.value = null;
    return;
  }
  expandedJobId.value = jobId;
  if (!applicantsByJob[jobId]) {
    const { data } = await companyApi.listApplications(jobId);
    applicantsByJob[jobId] = data.data;
  }
}

async function updateStatus(jobId: string, applicationId: string, status: ApplicationStatus) {
  await companyApi.updateApplicationStatus(applicationId, status);
  const { data } = await companyApi.listApplications(jobId);
  applicantsByJob[jobId] = data.data;
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Jobs</h1>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">Post a job</h2>
      <form class="grid grid-cols-1 md:grid-cols-3 gap-3" @submit.prevent="createJob">
        <input v-model="form.title" required placeholder="Job title" class="tv-input md:col-span-2" />
        <select v-model="form.type" class="tv-input">
          <option value="FULL_TIME">Full-time</option>
          <option value="PART_TIME">Part-time</option>
          <option value="INTERNSHIP">Internship</option>
          <option value="CONTRACT">Contract</option>
          <option value="FREELANCE">Freelance</option>
          <option value="APPRENTICESHIP">Apprenticeship</option>
          <option value="VOLUNTEER">Volunteer</option>
        </select>
        <input v-model="form.location" placeholder="Location" class="tv-input" />
        <label class="flex items-center gap-2 text-sm text-slate-600">
          <input v-model="form.remote" type="checkbox" class="accent-electric" /> Remote
        </label>
        <input v-model="form.skillsInput" placeholder="Skills (comma separated)" class="tv-input" />
        <textarea v-model="form.description" required placeholder="Job description" rows="2" class="tv-input md:col-span-3" />
        <button type="submit" class="tv-btn-primary md:col-span-3" :disabled="creating">
          {{ creating ? 'Posting…' : 'Post job' }}
        </button>
      </form>
      <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>
    </div>

    <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
    <p v-else-if="jobs.length === 0" class="text-sm text-slate-500">No jobs posted yet.</p>

    <div v-for="job in jobs" :key="job.id" class="tv-card">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-semibold text-navy">{{ job.title }}</h2>
          <p class="text-xs text-slate-400">{{ job._count?.applications ?? 0 }} applications</p>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="tv-badge"
            :class="job.isPublished ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'"
          >
            {{ job.isPublished ? 'Published' : 'Draft' }}
          </span>
          <button class="text-electric text-xs font-medium" @click="togglePublish(job)">
            {{ job.isPublished ? 'Unpublish' : 'Publish' }}
          </button>
          <button class="text-electric text-xs font-medium" @click="toggleApplicants(job.id)">
            {{ expandedJobId === job.id ? 'Hide applicants' : 'View applicants' }}
          </button>
        </div>
      </div>

      <div v-if="expandedJobId === job.id" class="mt-4 border-t border-slate-100 pt-4">
        <p v-if="!applicantsByJob[job.id]?.length" class="text-sm text-slate-500">No applicants yet.</p>
        <ul v-else class="divide-y divide-slate-100">
          <li v-for="app in applicantsByJob[job.id]" :key="app.id" class="py-3 flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-navy">{{ app.applicant.firstName }} {{ app.applicant.lastName }}</div>
              <div class="text-xs text-slate-400">{{ app.applicant.email }}</div>
            </div>
            <select
              class="tv-input text-xs !py-1 !w-auto"
              :value="app.status"
              @change="updateStatus(job.id, app.id, ($event.target as HTMLSelectElement).value as any)"
            >
              <option value="SUBMITTED">Submitted</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="REJECTED">Rejected</option>
              <option value="HIRED">Hired</option>
            </select>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
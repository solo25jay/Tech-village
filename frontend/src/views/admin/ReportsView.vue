<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { reportsApi, type ReportsSummary } from '@/services/reports.api';

const summary = ref<ReportsSummary | null>(null);
const loading = ref(true);
const error = ref('');

const roleBreakdown = computed(() => {
  const u = summary.value?.users;
  if (!u) return [];
  const rows = [
    { label: 'Learners', count: u.learners },
    { label: 'Mentors', count: u.mentors },
    { label: 'Professionals', count: u.professionals },
    { label: 'Companies', count: u.companies },
  ];
  const max = Math.max(1, ...rows.map((r) => r.count));
  return rows.map((r) => ({ ...r, percent: (r.count / max) * 100 }));
});

const pipeline = computed(() => {
  const rows = summary.value?.jobs.applicationsByStatus ?? [];
  const max = Math.max(1, ...rows.map((r) => r.count));
  return rows.map((r) => ({ ...r, percent: (r.count / max) * 100 }));
});

onMounted(async () => {
  try {
    const { data } = await reportsApi.summary();
    summary.value = data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load reports';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Reports</h1>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-if="loading" class="text-sm text-slate-500">Loading…</p>

    <template v-else-if="summary">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="tv-card">
          <h2 class="font-semibold text-navy mb-3">Users by role</h2>
          <p class="text-xs text-slate-400 mb-3">
            A user can hold more than one role, so these can add up to more than the total user count.
          </p>
          <div v-for="row in roleBreakdown" :key="row.label" class="mb-3 last:mb-0">
            <div class="flex justify-between text-sm">
              <span class="text-slate-600">{{ row.label }}</span>
              <span class="text-slate-500">{{ row.count }}</span>
            </div>
            <div class="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div class="h-full bg-gradient-purple-blue" :style="{ width: row.percent + '%' }" />
            </div>
          </div>
        </div>

        <div class="tv-card">
          <h2 class="font-semibold text-navy mb-3">Learning funnel</h2>
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between">
              <dt class="text-slate-600">Enrollments</dt>
              <dd class="text-slate-800 font-medium">{{ summary.learning.enrollments }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-slate-600">Completed courses</dt>
              <dd class="text-slate-800 font-medium">{{ summary.learning.completedEnrollments }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-slate-600">Completion rate</dt>
              <dd class="text-slate-800 font-medium">{{ summary.learning.completionRatePercent }}%</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-slate-600">Certificates issued</dt>
              <dd class="text-slate-800 font-medium">{{ summary.learning.certificatesIssued }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-slate-600">Qualified professionals</dt>
              <dd class="text-slate-800 font-medium">{{ summary.community.qualifiedProfessionals }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="tv-card">
        <h2 class="font-semibold text-navy mb-3">Job applications by status</h2>
        <p v-if="pipeline.length === 0" class="text-sm text-slate-500">No applications yet.</p>
        <div v-for="row in pipeline" :key="row.status" class="mb-3 last:mb-0">
          <div class="flex justify-between text-sm">
            <span class="text-slate-600 capitalize">{{ row.status.toLowerCase() }}</span>
            <span class="text-slate-500">{{ row.count }}</span>
          </div>
          <div class="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div class="h-full bg-gradient-cyan-teal" :style="{ width: row.percent + '%' }" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

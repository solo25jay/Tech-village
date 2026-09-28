<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { reportsApi, type ReportsSummary } from '@/services/reports.api';

const summary = ref<ReportsSummary | null>(null);
const loading = ref(true);
const error = ref('');

function formatNaira(kobo: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(kobo / 100);
}

const metrics = computed(() => {
  const s = summary.value;
  if (!s) return [];
  return [
    { label: 'Total users', value: s.users.total.toLocaleString() },
    { label: 'Active users', value: s.users.active.toLocaleString() },
    { label: 'Learners', value: s.users.learners.toLocaleString() },
    { label: 'Mentors', value: s.users.mentors.toLocaleString() },
    { label: 'Professionals', value: s.community.qualifiedProfessionals.toLocaleString() },
    { label: 'Companies', value: s.users.companies.toLocaleString() },
    { label: 'Course enrollments', value: s.learning.enrollments.toLocaleString() },
    { label: 'Completion rate', value: `${s.learning.completionRatePercent}%` },
    { label: 'Certificates issued', value: s.learning.certificatesIssued.toLocaleString() },
    { label: 'Active mentorships', value: s.mentorship.activeMentorships.toLocaleString() },
    { label: 'Upcoming events', value: s.events.upcoming.toLocaleString() },
    { label: 'Open jobs', value: s.jobs.openJobs.toLocaleString() },
    { label: 'Applications', value: s.jobs.applications.toLocaleString() },
    { label: 'Revenue', value: formatNaira(s.revenueKobo) },
  ];
});

const maxDaily = computed(() => Math.max(1, ...(summary.value?.registrationsLast30Days.map((d) => d.count) ?? [1])));

onMounted(async () => {
  try {
    const { data } = await reportsApi.summary();
    summary.value = data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load dashboard metrics';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Admin dashboard</h1>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-if="loading" class="text-sm text-slate-500">Loading…</p>

    <template v-else-if="summary">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="m in metrics" :key="m.label" class="tv-card text-center">
          <div class="text-2xl font-bold text-navy">{{ m.value }}</div>
          <div class="text-xs text-slate-500 mt-1">{{ m.label }}</div>
        </div>
      </div>

      <div class="tv-card">
        <h2 class="font-semibold text-navy mb-1">New registrations — last 30 days</h2>
        <p class="text-xs text-slate-400 mb-4">
          {{ summary.registrationsLast30Days.reduce((sum, d) => sum + d.count, 0) }} sign-ups in this period
        </p>
        <div class="flex items-end gap-1 h-32">
          <div
            v-for="day in summary.registrationsLast30Days"
            :key="day.date"
            class="flex-1 rounded-t bg-gradient-blue-cyan min-h-[2px]"
            :style="{ height: (day.count / maxDaily) * 100 + '%' }"
            :title="`${day.date}: ${day.count}`"
          />
        </div>
      </div>
    </template>
  </div>
</template>

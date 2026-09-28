<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { credentialsApi, type Assessment, type AssessmentAttempt, type Certificate } from '@/services/credentials.api';

const certificates = ref<Certificate[]>([]);
const assessments = ref<Assessment[]>([]);
const attempts = ref<AssessmentAttempt[]>([]);
const loading = ref(true);
const error = ref('');
const submittingId = ref<string | null>(null);
const scoreDrafts = reactive<Record<string, number>>({});

function bestAttempt(assessmentId: string) {
  return attempts.value.find((a) => a.assessment.id === assessmentId);
}

async function load() {
  loading.value = true;
  try {
    const [certsRes, assessmentsRes, attemptsRes] = await Promise.all([
      credentialsApi.myCertificates(),
      credentialsApi.listAssessments(),
      credentialsApi.myAttempts(),
    ]);
    certificates.value = certsRes.data.data;
    assessments.value = assessmentsRes.data.data;
    attempts.value = attemptsRes.data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load certificates';
  } finally {
    loading.value = false;
  }
}

async function submitAttempt(assessmentId: string) {
  const score = scoreDrafts[assessmentId];
  if (score === undefined) return;
  submittingId.value = assessmentId;
  try {
    await credentialsApi.submitAttempt(assessmentId, score);
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to submit attempt';
  } finally {
    submittingId.value = null;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Certificates</h1>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">My certificates</h2>
      <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
      <p v-else-if="certificates.length === 0" class="text-sm text-slate-500">
        No certificates yet — complete an assessment below and an admin will issue your certificate.
      </p>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="cert in certificates" :key="cert.id" class="rounded-lg border border-slate-200 p-4">
          <div class="flex items-start justify-between">
            <h3 class="font-semibold text-navy">{{ cert.programmeName }}</h3>
            <span class="tv-badge bg-gradient-cyan-teal text-white">Verified</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">Issued {{ new Date(cert.issueDate).toLocaleDateString() }}</p>
          <p class="text-xs text-slate-400 mt-0.5">ID: {{ cert.verificationCode }}</p>
          <router-link :to="`/verify/${cert.verificationCode}`" target="_blank" class="text-xs text-electric mt-1 inline-block">
            View public verification page
          </router-link>
          <div v-if="cert.skills?.length" class="mt-2 flex flex-wrap gap-1.5">
            <span v-for="s in cert.skills" :key="s" class="tv-badge bg-surface-light text-navy border border-slate-200">{{
              s
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">Available assessments</h2>
      <p v-if="assessments.length === 0" class="text-sm text-slate-500">No assessments published yet.</p>
      <ul v-else class="divide-y divide-slate-100">
        <li v-for="a in assessments" :key="a.id" class="py-3">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-navy">{{ a.title }}</div>
              <div class="text-xs text-slate-400">{{ a.type }} · pass score {{ a.passScore }}</div>
            </div>
            <span v-if="bestAttempt(a.id)" class="tv-badge" :class="bestAttempt(a.id)!.passed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">
              {{ bestAttempt(a.id)!.passed ? 'Passed' : 'Not passed' }} ({{ bestAttempt(a.id)!.score }})
            </span>
          </div>
          <form class="flex gap-2 mt-2" @submit.prevent="submitAttempt(a.id)">
            <input
              v-model.number="scoreDrafts[a.id]"
              type="number"
              min="0"
              max="100"
              placeholder="Your score"
              class="tv-input text-sm w-32"
            />
            <button type="submit" class="tv-btn-secondary text-sm" :disabled="submittingId === a.id">
              {{ submittingId === a.id ? 'Submitting…' : 'Submit attempt' }}
            </button>
          </form>
        </li>
      </ul>
    </div>
  </div>
</template>
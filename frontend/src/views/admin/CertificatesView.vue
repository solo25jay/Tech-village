<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { adminCredentialsApi } from '@/services/credentials.api';

const loading = ref(true);
const error = ref('');
const success = ref('');
const certificates = ref<any[]>([]);

const assessmentForm = reactive({ title: '', type: 'quiz', passScore: 70 });
const creatingAssessment = ref(false);

const certificateForm = reactive({ userId: '', programmeName: '', skillsInput: '' });
const issuing = ref(false);

async function load() {
  loading.value = true;
  try {
    const { data } = await adminCredentialsApi.listAllCertificates();
    certificates.value = (data as any).data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load certificates';
  } finally {
    loading.value = false;
  }
}

async function createAssessment() {
  creatingAssessment.value = true;
  error.value = '';
  try {
    await adminCredentialsApi.createAssessment(assessmentForm);
    success.value = `Assessment "${assessmentForm.title}" created.`;
    assessmentForm.title = '';
    assessmentForm.passScore = 70;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to create assessment';
  } finally {
    creatingAssessment.value = false;
  }
}

async function issueCertificate() {
  issuing.value = true;
  error.value = '';
  try {
    await adminCredentialsApi.issueCertificate({
      userId: certificateForm.userId,
      programmeName: certificateForm.programmeName,
      skills: certificateForm.skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    success.value = `Certificate issued for ${certificateForm.programmeName}.`;
    certificateForm.userId = '';
    certificateForm.programmeName = '';
    certificateForm.skillsInput = '';
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to issue certificate';
  } finally {
    issuing.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Certificates & assessments</h1>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-if="success" class="text-sm text-green-600">{{ success }}</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="tv-card">
        <h2 class="font-semibold text-navy mb-3">Create an assessment</h2>
        <form class="space-y-3" @submit.prevent="createAssessment">
          <input v-model="assessmentForm.title" required placeholder="Assessment title" class="tv-input" />
          <select v-model="assessmentForm.type" class="tv-input">
            <option value="quiz">Quiz</option>
            <option value="technical_test">Technical test</option>
            <option value="practical">Practical</option>
            <option value="project">Project</option>
            <option value="career">Career</option>
          </select>
          <input v-model.number="assessmentForm.passScore" type="number" min="0" max="100" placeholder="Pass score" class="tv-input" />
          <button type="submit" class="tv-btn-primary w-full" :disabled="creatingAssessment">
            {{ creatingAssessment ? 'Creating…' : 'Create assessment' }}
          </button>
        </form>
      </div>

      <div class="tv-card">
        <h2 class="font-semibold text-navy mb-3">Issue a certificate</h2>
        <form class="space-y-3" @submit.prevent="issueCertificate">
          <input v-model="certificateForm.userId" required placeholder="User ID" class="tv-input" />
          <input v-model="certificateForm.programmeName" required placeholder="Programme name" class="tv-input" />
          <input v-model="certificateForm.skillsInput" placeholder="Skills (comma separated)" class="tv-input" />
          <button type="submit" class="tv-btn-primary w-full" :disabled="issuing">
            {{ issuing ? 'Issuing…' : 'Issue certificate' }}
          </button>
        </form>
        <p class="text-xs text-slate-400 mt-2">
          Find a user's ID from the Users screen (once built) or Prisma Studio for now.
        </p>
      </div>
    </div>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">All issued certificates</h2>
      <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
      <p v-else-if="certificates.length === 0" class="text-sm text-slate-500">No certificates issued yet.</p>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-400 border-b border-slate-100">
            <th class="py-2 font-medium">Holder</th>
            <th class="py-2 font-medium">Programme</th>
            <th class="py-2 font-medium">Issued</th>
            <th class="py-2 font-medium">Verification ID</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cert in certificates" :key="cert.id" class="border-b border-slate-50">
            <td class="py-2">{{ cert.user.firstName }} {{ cert.user.lastName }}</td>
            <td class="py-2">{{ cert.programmeName }}</td>
            <td class="py-2 text-slate-500">{{ new Date(cert.issueDate).toLocaleDateString() }}</td>
            <td class="py-2 text-slate-500">{{ cert.verificationCode }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
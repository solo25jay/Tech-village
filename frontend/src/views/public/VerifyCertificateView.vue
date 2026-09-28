<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { publicCredentialsApi, type CertificateVerification } from '@/services/credentials.api';

const route = useRoute();
const code = route.params.code as string;

const result = ref<CertificateVerification | null>(null);
const loading = ref(true);
const notFound = ref(false);

onMounted(async () => {
  try {
    const { data } = await publicCredentialsApi.verify(code);
    result.value = data.data;
  } catch {
    notFound.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-surface-light flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <div class="inline-block text-xl font-bold bg-gradient-purple-blue bg-clip-text text-transparent">
          TECH VILLAGE
        </div>
        <p class="text-xs text-slate-500 mt-1">Certificate verification</p>
      </div>

      <div class="tv-card text-center">
        <p v-if="loading" class="text-sm text-slate-500">Verifying…</p>

        <template v-else-if="notFound">
          <div class="text-red-500 text-3xl mb-2">✕</div>
          <p class="text-sm text-slate-600">No certificate found with code <strong>{{ code }}</strong>.</p>
        </template>

        <template v-else-if="result">
          <div class="text-green-500 text-3xl mb-2">✓</div>
          <p class="text-sm text-slate-500">This certificate is valid.</p>
          <h1 class="text-lg font-semibold text-navy mt-3">{{ result.programmeName }}</h1>
          <p class="text-sm text-slate-600 mt-1">Awarded to {{ result.holderName }}</p>
          <p class="text-xs text-slate-400 mt-2">Issued {{ new Date(result.issueDate).toLocaleDateString() }}</p>
          <p class="text-xs text-slate-400">Verification ID: {{ result.verificationCode }}</p>
          <div v-if="result.skills?.length" class="mt-3 flex flex-wrap justify-center gap-1.5">
            <span
              v-for="s in result.skills"
              :key="s"
              class="tv-badge bg-surface-light text-navy border border-slate-200"
              >{{ s }}</span
            >
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
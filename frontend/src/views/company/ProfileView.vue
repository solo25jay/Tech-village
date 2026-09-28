<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { companyApi } from '@/services/jobs.api';

const loading = ref(true);
const error = ref('');
const success = ref('');
const saving = ref(false);

const form = reactive({ name: '', description: '', website: '', industry: '' });

async function load() {
  loading.value = true;
  try {
    const { data } = await companyApi.getMyCompany();
    if (data.data) {
      form.name = data.data.name;
      form.description = data.data.description ?? '';
      form.website = data.data.website ?? '';
      form.industry = data.data.industry ?? '';
    }
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load company profile';
  } finally {
    loading.value = false;
  }
}

async function save() {
  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    await companyApi.upsertMyCompany({
      name: form.name,
      description: form.description || undefined,
      website: form.website || undefined,
      industry: form.industry || undefined,
    });
    success.value = 'Company profile saved.';
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to save company profile';
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Company profile</h1>

    <div class="tv-card max-w-lg">
      <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
      <form v-else class="space-y-3" @submit.prevent="save">
        <input v-model="form.name" required placeholder="Company name" class="tv-input" />
        <input v-model="form.industry" placeholder="Industry" class="tv-input" />
        <input v-model="form.website" placeholder="Website" class="tv-input" />
        <textarea v-model="form.description" placeholder="Description" rows="3" class="tv-input" />
        <button type="submit" class="tv-btn-primary w-full" :disabled="saving">
          {{ saving ? 'Saving…' : 'Save profile' }}
        </button>
      </form>
      <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>
      <p v-if="success" class="text-sm text-green-600 mt-2">{{ success }}</p>
    </div>
  </div>
</template>
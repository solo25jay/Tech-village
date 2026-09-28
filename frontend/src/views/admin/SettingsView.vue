<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { settingsApi, type SettingRow } from '@/services/reports.api';

const settings = ref<SettingRow[]>([]);
const drafts = reactive<Record<string, string>>({});
const loading = ref(true);
const savingKey = ref<string | null>(null);
const savedKey = ref<string | null>(null);
const error = ref('');

async function load() {
  loading.value = true;
  try {
    const { data } = await settingsApi.list();
    settings.value = data.data;
    for (const s of data.data) drafts[s.key] = s.value;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load settings';
  } finally {
    loading.value = false;
  }
}

async function save(key: string) {
  savingKey.value = key;
  savedKey.value = null;
  error.value = '';
  try {
    await settingsApi.update(key, drafts[key]);
    const row = settings.value.find((r) => r.key === key);
    if (row) row.value = drafts[key];
    savedKey.value = key;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to save setting';
  } finally {
    savingKey.value = null;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Settings</h1>
    <p class="text-sm text-slate-500">
      These override the defaults from the server's environment variables. Changes apply immediately — no
      redeploy needed.
    </p>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div class="tv-card max-w-2xl">
      <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
      <div v-else class="space-y-5">
        <div v-for="s in settings" :key="s.key">
          <label class="text-sm font-medium text-slate-700">{{ s.label }}</label>
          <div class="flex gap-2 mt-1">
            <input v-model="drafts[s.key]" class="tv-input flex-1" />
            <button
              class="tv-btn-secondary text-sm"
              :disabled="savingKey === s.key || drafts[s.key] === s.value"
              @click="save(s.key)"
            >
              {{ savingKey === s.key ? 'Saving…' : 'Save' }}
            </button>
          </div>
          <p v-if="savedKey === s.key" class="text-xs text-green-600 mt-1">Saved.</p>
        </div>
      </div>
    </div>
  </div>
</template>

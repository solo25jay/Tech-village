<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { communityApi, type MyCommunityAccess } from '@/services/community.api';

const data = ref<MyCommunityAccess | null>(null);
const loading = ref(true);
const error = ref('');

const platformLabels: Record<string, string> = { DISCORD: 'Discord', TELEGRAM: 'Telegram' };

async function load() {
  loading.value = true;
  try {
    const { data: res } = await communityApi.me();
    data.value = res.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load community access';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Community</h1>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-if="loading" class="text-sm text-slate-500">Loading…</p>

    <template v-else-if="data">
      <div class="tv-card">
        <div class="flex items-center gap-2">
          <span class="tv-badge bg-gradient-cyan-teal text-white">General Member</span>
          <span v-if="data.isProfessional" class="tv-badge bg-gradient-purple-blue text-white">
            Tech Village Professional
          </span>
        </div>
        <p class="text-sm text-slate-500 mt-2">
          Tech Village tracks your identity, progress and eligibility. Real-time conversations, channels and
          networking happen on Discord and Telegram.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="row in data.access.filter((r) => r.communityType === 'GENERAL')"
          :key="row.id"
          class="tv-card"
        >
          <h2 class="font-semibold text-navy">{{ platformLabels[row.communityPlatform] }} — General</h2>
          <p class="text-sm text-slate-500 mt-1">
            Open community for all Tech Village members: introductions, questions, tech talk, study groups.
          </p>
          <a
            v-if="row.accessUrl && row.status === 'GRANTED'"
            :href="row.accessUrl"
            target="_blank"
            rel="noopener"
            class="tv-btn-primary w-full mt-3 text-sm text-center"
            >Join {{ platformLabels[row.communityPlatform] }}</a
          >
        </div>
      </div>

      <div class="tv-card">
        <h2 class="font-semibold text-navy">Professional Community</h2>
        <template v-if="data.isProfessional">
          <p class="text-sm text-slate-500 mt-1">
            You're Tech Village Professional — access #jobs, #freelancing, #collaboration and #opportunities.
          </p>
          <a
            v-for="row in data.access.filter((r) => r.communityType === 'PROFESSIONAL' && r.status === 'GRANTED')"
            :key="row.id"
            :href="row.accessUrl ?? '#'"
            target="_blank"
            rel="noopener"
            class="tv-btn-primary w-full mt-3 text-sm text-center block"
          >
            Join Professional {{ platformLabels[row.communityPlatform] }}
          </a>
        </template>
        <p v-else class="text-sm text-slate-500 mt-1">{{ data.professionalOnboarding }}</p>
      </div>
    </template>
  </div>
</template>
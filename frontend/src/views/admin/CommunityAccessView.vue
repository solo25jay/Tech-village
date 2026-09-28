<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { adminCommunityApi, type ProfessionalProfileRow } from '@/services/community.api';

const profiles = ref<ProfessionalProfileRow[]>([]);
const loading = ref(true);
const error = ref('');

async function load() {
  loading.value = true;
  try {
    const { data } = await adminCommunityApi.listProfessionals();
    profiles.value = data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load community access data';
  } finally {
    loading.value = false;
  }
}

async function toggle(profile: ProfessionalProfileRow) {
  await adminCommunityApi.setQualification(profile.userId, !profile.isQualified);
  await load();
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Community access</h1>
    <p class="text-sm text-slate-500">
      Tech Village stays the source of truth for eligibility. General Discord/Telegram access is granted to every
      member automatically. Professional community access is unlocked here once a learner meets the professional
      requirements (learning path, projects, assessments, certification).
    </p>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div class="tv-card">
      <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
      <p v-else-if="profiles.length === 0" class="text-sm text-slate-500">No professional profiles yet.</p>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-400 border-b border-slate-100">
            <th class="py-2 font-medium">User</th>
            <th class="py-2 font-medium">Email</th>
            <th class="py-2 font-medium">Status</th>
            <th class="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in profiles" :key="p.id" class="border-b border-slate-50">
            <td class="py-2">{{ p.user.firstName }} {{ p.user.lastName }}</td>
            <td class="py-2 text-slate-500">{{ p.user.email }}</td>
            <td class="py-2">
              <span
                class="tv-badge"
                :class="p.isQualified ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'"
              >
                {{ p.isQualified ? 'Professional' : 'General' }}
              </span>
            </td>
            <td class="py-2">
              <button class="text-electric text-xs font-medium" @click="toggle(p)">
                {{ p.isQualified ? 'Revoke professional access' : 'Grant professional access' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
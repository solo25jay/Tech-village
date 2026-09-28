<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { adminMentorshipApi, type MentorProfileSummary } from '@/services/mentorship.api';

const mentors = ref<MentorProfileSummary[]>([]);
const loading = ref(true);
const error = ref('');

async function load() {
  loading.value = true;
  try {
    const { data } = await adminMentorshipApi.listAll();
    mentors.value = data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load mentor applications';
  } finally {
    loading.value = false;
  }
}

async function setApproval(id: string, isApproved: boolean) {
  await adminMentorshipApi.setApproval(id, isApproved);
  await load();
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Mentors</h1>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div class="tv-card">
      <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-400 border-b border-slate-100">
            <th class="py-2 font-medium">Name</th>
            <th class="py-2 font-medium">Email</th>
            <th class="py-2 font-medium">Expertise</th>
            <th class="py-2 font-medium">Status</th>
            <th class="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mentor in mentors" :key="mentor.id" class="border-b border-slate-50">
            <td class="py-2">{{ mentor.user.firstName }} {{ mentor.user.lastName }}</td>
            <td class="py-2 text-slate-500">{{ mentor.user.email }}</td>
            <td class="py-2 text-slate-500">{{ mentor.expertise.join(', ') || '—' }}</td>
            <td class="py-2">
              <span
                class="tv-badge"
                :class="mentor.isApproved ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'"
              >
                {{ mentor.isApproved ? 'Approved' : 'Pending' }}
              </span>
            </td>
            <td class="py-2">
              <button
                v-if="!mentor.isApproved"
                class="text-electric text-xs font-medium"
                @click="setApproval(mentor.id, true)"
              >
                Approve
              </button>
              <button v-else class="text-slate-400 text-xs font-medium" @click="setApproval(mentor.id, false)">
                Revoke
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
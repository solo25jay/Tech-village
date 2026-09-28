<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { mentorApi, type MentorSideMentorship } from '@/services/mentorship.api';

const mentorships = ref<MentorSideMentorship[]>([]);
const loading = ref(true);
const error = ref('');
const noteDrafts = reactive<Record<string, string>>({});
const savingNoteId = ref<string | null>(null);

const statusStyles: Record<string, string> = {
  REQUESTED: 'bg-amber-50 text-amber-600',
  ACCEPTED: 'bg-blue-50 text-electric',
  DECLINED: 'bg-red-50 text-red-600',
  ACTIVE: 'bg-green-50 text-green-600',
  ENDED: 'bg-slate-100 text-slate-500',
};

async function load() {
  loading.value = true;
  try {
    const { data } = await mentorApi.listMentorships();
    mentorships.value = data.data;
    for (const m of data.data) noteDrafts[m.id] ??= m.note ?? '';
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load mentees';
  } finally {
    loading.value = false;
  }
}

async function respond(mentorshipId: string, accept: boolean) {
  await mentorApi.respondToRequest(mentorshipId, accept);
  await load();
}

async function saveNote(mentorshipId: string) {
  savingNoteId.value = mentorshipId;
  try {
    await mentorApi.setNote(mentorshipId, noteDrafts[mentorshipId] ?? '');
  } finally {
    savingNoteId.value = null;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Mentees</h1>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
    <p v-else-if="mentorships.length === 0" class="text-sm text-slate-500">No mentee activity yet.</p>

    <div v-for="m in mentorships" :key="m.id" class="tv-card">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div
            class="h-10 w-10 rounded-full bg-gradient-purple-blue flex items-center justify-center text-white text-sm font-semibold"
          >
            {{ m.mentee.firstName[0] }}{{ m.mentee.lastName[0] }}
          </div>
          <div>
            <div class="text-sm font-medium text-navy">{{ m.mentee.firstName }} {{ m.mentee.lastName }}</div>
            <div class="text-xs text-slate-400">{{ m.mentee.email }}</div>
          </div>
        </div>
        <span class="tv-badge" :class="statusStyles[m.status]">{{ m.status }}</span>
      </div>

      <div v-if="m.status === 'REQUESTED'" class="mt-3 flex gap-2">
        <button class="tv-btn-primary text-sm" @click="respond(m.id, true)">Accept</button>
        <button class="tv-btn-secondary text-sm" @click="respond(m.id, false)">Decline</button>
      </div>

      <div v-if="m.sessions.length" class="mt-3 text-xs text-slate-500">
        Next session: {{ new Date(m.sessions[0].scheduledAt).toLocaleString() }}
      </div>

      <div v-if="m.status !== 'REQUESTED' && m.status !== 'DECLINED'" class="mt-4">
        <label class="text-xs text-slate-500">Private note (never visible to the mentee)</label>
        <textarea v-model="noteDrafts[m.id]" rows="2" class="tv-input mt-1 text-sm" />
        <button class="tv-btn-secondary text-xs mt-2" :disabled="savingNoteId === m.id" @click="saveNote(m.id)">
          {{ savingNoteId === m.id ? 'Saving…' : 'Save note' }}
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { mentorshipApi, type MenteeMentorship, type MentorProfileSummary } from '@/services/mentorship.api';

const mentors = ref<MentorProfileSummary[]>([]);
const myMentorships = ref<MenteeMentorship[]>([]);
const loading = ref(true);
const error = ref('');
const requestingId = ref<string | null>(null);

const applyForm = reactive({ title: '', bio: '', expertiseInput: '' });
const applying = ref(false);
const applied = ref(false);

async function applyAsMentor() {
  applying.value = true;
  try {
    await mentorshipApi.applyAsMentor({
      title: applyForm.title || undefined,
      bio: applyForm.bio || undefined,
      expertise: applyForm.expertiseInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    applied.value = true;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to submit mentor application';
  } finally {
    applying.value = false;
  }
}

const statusStyles: Record<string, string> = {
  REQUESTED: 'bg-amber-50 text-amber-600',
  ACCEPTED: 'bg-blue-50 text-electric',
  DECLINED: 'bg-red-50 text-red-600',
  ACTIVE: 'bg-green-50 text-green-600',
  ENDED: 'bg-slate-100 text-slate-500',
};

function alreadyRequested(mentorProfileId: string) {
  return myMentorships.value.some(
    (m) => m.mentorProfile?.id === mentorProfileId && ['REQUESTED', 'ACCEPTED', 'ACTIVE'].includes(m.status),
  );
}

async function load() {
  loading.value = true;
  try {
    const [mentorsRes, mineRes] = await Promise.all([mentorshipApi.listMentors(), mentorshipApi.myMentorships()]);
    mentors.value = mentorsRes.data.data;
    myMentorships.value = mineRes.data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load mentorship data';
  } finally {
    loading.value = false;
  }
}

async function request(mentorProfileId: string) {
  requestingId.value = mentorProfileId;
  try {
    await mentorshipApi.requestMentorship(mentorProfileId);
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to send request';
  } finally {
    requestingId.value = null;
  }
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Mentorship</h1>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">My mentorships</h2>
      <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
      <p v-else-if="myMentorships.length === 0" class="text-sm text-slate-500">
        You haven't requested mentorship yet — browse mentors below.
      </p>
      <ul v-else class="divide-y divide-slate-100">
        <li v-for="m in myMentorships" :key="m.id" class="py-3 flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-navy">{{ m.mentor.firstName }} {{ m.mentor.lastName }}</div>
            <div v-if="m.sessions.length" class="text-xs text-slate-400 mt-0.5">
              Next session: {{ new Date(m.sessions[0].scheduledAt).toLocaleString() }}
            </div>
          </div>
          <span class="tv-badge" :class="statusStyles[m.status]">{{ m.status }}</span>
        </li>
      </ul>
    </div>

    <div>
      <h2 class="font-semibold text-navy mb-3">Find a mentor</h2>
      <p v-if="!loading && mentors.length === 0" class="text-sm text-slate-500">
        No approved mentors yet — check back soon.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="mentor in mentors" :key="mentor.id" class="tv-card">
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 rounded-full bg-gradient-purple-blue flex items-center justify-center text-white text-sm font-semibold"
            >
              {{ mentor.user.firstName[0] }}{{ mentor.user.lastName[0] }}
            </div>
            <div>
              <div class="text-sm font-medium text-navy">{{ mentor.user.firstName }} {{ mentor.user.lastName }}</div>
              <div v-if="mentor.title" class="text-xs text-slate-500">{{ mentor.title }}</div>
            </div>
          </div>
          <p v-if="mentor.bio" class="text-sm text-slate-500 mt-3 line-clamp-3">{{ mentor.bio }}</p>
          <div v-if="mentor.expertise?.length" class="mt-3 flex flex-wrap gap-1.5">
            <span
              v-for="skill in mentor.expertise"
              :key="skill"
              class="tv-badge bg-surface-light text-navy border border-slate-200"
              >{{ skill }}</span
            >
          </div>
          <button
            v-if="!alreadyRequested(mentor.id)"
            class="tv-btn-primary w-full mt-4 text-sm"
            :disabled="requestingId === mentor.id"
            @click="request(mentor.id)"
          >
            {{ requestingId === mentor.id ? 'Requesting…' : 'Request mentorship' }}
          </button>
          <div v-else class="tv-btn-secondary w-full mt-4 text-sm text-center opacity-60">Requested</div>
        </div>
      </div>
    </div>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">Become a mentor</h2>
      <p v-if="applied" class="text-sm text-green-600">
        Application submitted — an admin will review it shortly.
      </p>
      <form v-else class="grid grid-cols-1 md:grid-cols-2 gap-3" @submit.prevent="applyAsMentor">
        <input v-model="applyForm.title" placeholder="Professional title" class="tv-input" />
        <input v-model="applyForm.expertiseInput" placeholder="Expertise (comma separated)" class="tv-input" />
        <textarea v-model="applyForm.bio" placeholder="Short bio" rows="2" class="tv-input md:col-span-2" />
        <button type="submit" class="tv-btn-secondary md:col-span-2 text-sm" :disabled="applying">
          {{ applying ? 'Submitting…' : 'Apply to mentor' }}
        </button>
      </form>
    </div>
  </div>
</template>
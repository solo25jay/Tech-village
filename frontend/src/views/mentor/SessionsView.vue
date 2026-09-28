<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { mentorApi, type MentorSideMentorship } from '@/services/mentorship.api';

const activeMentorships = ref<MentorSideMentorship[]>([]);
const loading = ref(true);
const error = ref('');
const scheduling = ref<string | null>(null);

const forms = reactive<Record<string, { date: string; time: string; durationMins: number; meetingUrl: string }>>({});

async function load() {
  loading.value = true;
  try {
    const [accepted, active] = await Promise.all([
      mentorApi.listMentorships('ACCEPTED'),
      mentorApi.listMentorships('ACTIVE'),
    ]);
    activeMentorships.value = [...accepted.data.data, ...active.data.data];
    for (const m of activeMentorships.value) {
      forms[m.id] ??= { date: '', time: '', durationMins: 30, meetingUrl: '' };
    }
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load mentorships';
  } finally {
    loading.value = false;
  }
}

async function schedule(mentorshipId: string) {
  const form = forms[mentorshipId];
  if (!form.date || !form.time) return;
  scheduling.value = mentorshipId;
  try {
    const scheduledAt = new Date(`${form.date}T${form.time}`).toISOString();
    await mentorApi.scheduleSession(mentorshipId, {
      scheduledAt,
      durationMins: form.durationMins,
      meetingUrl: form.meetingUrl || undefined,
    });
    form.date = '';
    form.time = '';
    form.meetingUrl = '';
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to schedule session';
  } finally {
    scheduling.value = null;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Sessions</h1>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
    <p v-else-if="activeMentorships.length === 0" class="text-sm text-slate-500">
      No accepted mentees yet — accept a request from Mentees to schedule sessions.
    </p>

    <div v-for="m in activeMentorships" :key="m.id" class="tv-card">
      <h2 class="font-semibold text-navy mb-1">{{ m.mentee.firstName }} {{ m.mentee.lastName }}</h2>

      <ul v-if="m.sessions.length" class="mt-2 mb-3 text-sm text-slate-600 space-y-1">
        <li v-for="s in m.sessions" :key="s.id">
          {{ new Date(s.scheduledAt).toLocaleString() }} · {{ s.durationMins }}min
          <a v-if="s.meetingUrl" :href="s.meetingUrl" target="_blank" rel="noopener" class="text-electric ml-1"
            >Join link</a
          >
        </li>
      </ul>

      <form class="grid grid-cols-1 md:grid-cols-4 gap-2" @submit.prevent="schedule(m.id)">
        <input v-model="forms[m.id].date" type="date" required class="tv-input" />
        <input v-model="forms[m.id].time" type="time" required class="tv-input" />
        <input v-model.number="forms[m.id].durationMins" type="number" min="15" step="15" class="tv-input" placeholder="Minutes" />
        <input v-model="forms[m.id].meetingUrl" placeholder="Zoom / Meet / Teams link" class="tv-input" />
        <button type="submit" class="tv-btn-primary md:col-span-4 text-sm" :disabled="scheduling === m.id">
          {{ scheduling === m.id ? 'Scheduling…' : 'Schedule session' }}
        </button>
      </form>
    </div>
  </div>
</template>
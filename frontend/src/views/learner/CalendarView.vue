<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { eventsApi, type EventItem, type EventRegistration } from '@/services/events.api';

const events = ref<EventItem[]>([]);
const myRegistrations = ref<EventRegistration[]>([]);
const loading = ref(true);
const error = ref('');
const registeringId = ref<string | null>(null);

const typeLabels: Record<string, string> = {
  webinar: 'Webinar',
  live_class: 'Live class',
  workshop: 'Workshop',
  group_mentorship: 'Group mentorship',
  orientation: 'Orientation',
};

function isRegistered(eventId: string) {
  return myRegistrations.value.some((r) => r.eventId === eventId);
}

async function load() {
  loading.value = true;
  try {
    const [eventsRes, registrationsRes] = await Promise.all([eventsApi.listUpcoming(), eventsApi.myRegistrations()]);
    events.value = eventsRes.data.data;
    myRegistrations.value = registrationsRes.data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load events';
  } finally {
    loading.value = false;
  }
}

async function register(eventId: string) {
  registeringId.value = eventId;
  try {
    await eventsApi.register(eventId);
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to register';
  } finally {
    registeringId.value = null;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Calendar</h1>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">My upcoming events</h2>
      <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
      <p v-else-if="myRegistrations.length === 0" class="text-sm text-slate-500">
        No registrations yet — register for something below.
      </p>
      <ul v-else class="divide-y divide-slate-100">
        <li v-for="r in myRegistrations" :key="r.id" class="py-3 flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-navy">{{ r.event.title }}</div>
            <div class="text-xs text-slate-400">{{ new Date(r.event.startTime).toLocaleString() }}</div>
          </div>
          <a
            v-if="r.event.meetingUrl"
            :href="r.event.meetingUrl"
            target="_blank"
            rel="noopener"
            class="tv-badge bg-gradient-blue-cyan text-white"
            >Join</a
          >
        </li>
      </ul>
    </div>

    <div>
      <h2 class="font-semibold text-navy mb-3">Upcoming events</h2>
      <div v-if="!loading && events.length === 0" class="text-sm text-slate-500">No events scheduled.</div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="ev in events" :key="ev.id" class="tv-card">
          <div class="flex items-start justify-between">
            <h3 class="font-semibold text-navy">{{ ev.title }}</h3>
            <span class="tv-badge bg-gradient-purple-blue text-white">{{ typeLabels[ev.eventType] }}</span>
          </div>
          <p v-if="ev.description" class="text-sm text-slate-500 mt-2 line-clamp-2">{{ ev.description }}</p>
          <div class="text-xs text-slate-400 mt-2">
            {{ new Date(ev.startTime).toLocaleString() }} –
            {{ new Date(ev.endTime).toLocaleTimeString() }}
          </div>
          <div v-if="ev.maxAttendees" class="text-xs text-slate-400 mt-1">
            {{ ev._count.registrations }} / {{ ev.maxAttendees }} registered
          </div>

          <button
            v-if="!isRegistered(ev.id)"
            class="tv-btn-primary w-full mt-3 text-sm"
            :disabled="registeringId === ev.id"
            @click="register(ev.id)"
          >
            {{ registeringId === ev.id ? 'Registering…' : 'Register' }}
          </button>
          <div v-else class="tv-btn-secondary w-full mt-3 text-sm text-center opacity-60">Registered</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { hostEventsApi, type EventItem, type EventType } from '@/services/events.api';

const events = ref<EventItem[]>([]);
const loading = ref(true);
const error = ref('');
const creating = ref(false);

const form = reactive({
  title: '',
  description: '',
  eventType: 'webinar' as EventType,
  date: '',
  startTime: '',
  endTime: '',
  maxAttendees: undefined as number | undefined,
  meetingUrl: '',
});

async function load() {
  loading.value = true;
  try {
    const { data } = await hostEventsApi.listMine();
    events.value = data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load events';
  } finally {
    loading.value = false;
  }
}

async function createEvent() {
  creating.value = true;
  error.value = '';
  try {
    await hostEventsApi.create({
      title: form.title,
      description: form.description || undefined,
      eventType: form.eventType,
      startTime: new Date(`${form.date}T${form.startTime}`).toISOString(),
      endTime: new Date(`${form.date}T${form.endTime}`).toISOString(),
      maxAttendees: form.maxAttendees,
      meetingUrl: form.meetingUrl || undefined,
    });
    form.title = '';
    form.description = '';
    form.date = '';
    form.startTime = '';
    form.endTime = '';
    form.maxAttendees = undefined;
    form.meetingUrl = '';
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to create event';
  } finally {
    creating.value = false;
  }
}

async function cancelEvent(eventId: string) {
  await hostEventsApi.cancel(eventId);
  await load();
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Events</h1>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">Create an event</h2>
      <form class="grid grid-cols-1 md:grid-cols-3 gap-3" @submit.prevent="createEvent">
        <input v-model="form.title" required placeholder="Event title" class="tv-input md:col-span-2" />
        <select v-model="form.eventType" class="tv-input">
          <option value="webinar">Webinar</option>
          <option value="live_class">Live class</option>
          <option value="workshop">Workshop</option>
          <option value="group_mentorship">Group mentorship</option>
          <option value="orientation">Orientation</option>
        </select>
        <input v-model="form.date" type="date" required class="tv-input" />
        <input v-model="form.startTime" type="time" required class="tv-input" />
        <input v-model="form.endTime" type="time" required class="tv-input" />
        <input v-model.number="form.maxAttendees" type="number" min="1" placeholder="Max attendees (optional)" class="tv-input" />
        <input v-model="form.meetingUrl" placeholder="Zoom / Meet / Teams link" class="tv-input md:col-span-2" />
        <textarea v-model="form.description" placeholder="Description" rows="2" class="tv-input md:col-span-3" />
        <button type="submit" class="tv-btn-primary md:col-span-3" :disabled="creating">
          {{ creating ? 'Creating…' : 'Create event' }}
        </button>
      </form>
      <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>
    </div>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">My events</h2>
      <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
      <p v-else-if="events.length === 0" class="text-sm text-slate-500">No events yet.</p>
      <ul v-else class="divide-y divide-slate-100">
        <li v-for="ev in events" :key="ev.id" class="py-3 flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-navy">{{ ev.title }}</div>
            <div class="text-xs text-slate-400">
              {{ new Date(ev.startTime).toLocaleString() }} · {{ ev._count.registrations }} registered
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span
              class="tv-badge"
              :class="ev.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'"
            >
              {{ ev.status }}
            </span>
            <button
              v-if="ev.status !== 'CANCELLED'"
              class="text-slate-400 hover:text-red-500 text-xs"
              @click="cancelEvent(ev.id)"
            >
              Cancel
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
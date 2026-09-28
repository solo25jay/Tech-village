<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { hostEventsApi, type EventItem } from '@/services/events.api';

const events = ref<EventItem[]>([]);
const loading = ref(true);
const error = ref('');

async function load() {
  loading.value = true;
  try {
    const { data } = await hostEventsApi.listMine(); // admins see all events, mentors see their own
    events.value = data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load events';
  } finally {
    loading.value = false;
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
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div class="tv-card">
      <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-400 border-b border-slate-100">
            <th class="py-2 font-medium">Title</th>
            <th class="py-2 font-medium">Type</th>
            <th class="py-2 font-medium">Start</th>
            <th class="py-2 font-medium">Registered</th>
            <th class="py-2 font-medium">Status</th>
            <th class="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ev in events" :key="ev.id" class="border-b border-slate-50">
            <td class="py-2">{{ ev.title }}</td>
            <td class="py-2 text-slate-500">{{ ev.eventType }}</td>
            <td class="py-2 text-slate-500">{{ new Date(ev.startTime).toLocaleString() }}</td>
            <td class="py-2 text-slate-500">{{ ev._count.registrations }}</td>
            <td class="py-2">
              <span
                class="tv-badge"
                :class="ev.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'"
              >
                {{ ev.status }}
              </span>
            </td>
            <td class="py-2">
              <button
                v-if="ev.status !== 'CANCELLED'"
                class="text-electric text-xs font-medium"
                @click="cancelEvent(ev.id)"
              >
                Cancel
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
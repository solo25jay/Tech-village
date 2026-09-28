<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { emailsApi, type EmailCampaign, type EmailSegment } from '@/services/emails.api';

const campaigns = ref<EmailCampaign[]>([]);
const loading = ref(true);
const error = ref('');
const creating = ref(false);
const sendingId = ref<string | null>(null);

const form = reactive({ subject: '', body: '', segment: 'ALL_USERS' as EmailSegment });

const segmentLabels: Record<EmailSegment, string> = {
  ALL_USERS: 'All users',
  LEARNERS: 'Learners',
  MENTORS: 'Mentors',
  PROFESSIONALS: 'Professionals',
  COMPANIES: 'Companies',
};

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-500',
  SENDING: 'bg-amber-50 text-amber-600',
  SENT: 'bg-green-50 text-green-600',
  FAILED: 'bg-red-50 text-red-600',
};

async function load() {
  loading.value = true;
  try {
    const { data } = await emailsApi.list();
    campaigns.value = data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load campaigns';
  } finally {
    loading.value = false;
  }
}

async function createDraft() {
  creating.value = true;
  error.value = '';
  try {
    await emailsApi.createDraft(form);
    form.subject = '';
    form.body = '';
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to create draft';
  } finally {
    creating.value = false;
  }
}

async function sendCampaign(campaignId: string) {
  sendingId.value = campaignId;
  try {
    await emailsApi.send(campaignId);
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to send campaign';
  } finally {
    sendingId.value = null;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Emails</h1>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">Create a campaign</h2>
      <form class="space-y-3" @submit.prevent="createDraft">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input v-model="form.subject" required placeholder="Subject" class="tv-input" />
          <select v-model="form.segment" class="tv-input">
            <option v-for="(label, key) in segmentLabels" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <textarea
          v-model="form.body"
          required
          placeholder="Message body — use [First Name] to personalize"
          rows="4"
          class="tv-input"
        />
        <button type="submit" class="tv-btn-primary" :disabled="creating">
          {{ creating ? 'Saving…' : 'Save as draft' }}
        </button>
      </form>
      <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>
    </div>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">Campaigns</h2>
      <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
      <p v-else-if="campaigns.length === 0" class="text-sm text-slate-500">No campaigns yet.</p>

      <div v-else class="space-y-3">
        <div v-for="c in campaigns" :key="c.id" class="rounded-lg border border-slate-100 p-3">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-sm font-medium text-navy">{{ c.subject }}</div>
              <div class="text-xs text-slate-400 mt-0.5">
                {{ segmentLabels[c.segment] }} · by {{ c.createdBy.firstName }} {{ c.createdBy.lastName }}
              </div>
            </div>
            <span class="tv-badge" :class="statusStyles[c.status]">{{ c.status }}</span>
          </div>
          <p class="text-sm text-slate-500 mt-2 line-clamp-2">{{ c.body }}</p>
          <div class="mt-2 flex items-center justify-between">
            <span v-if="c.recipientCount !== null" class="text-xs text-slate-400">
              Sent to {{ c.recipientCount }} recipient{{ c.recipientCount === 1 ? '' : 's' }}
            </span>
            <span v-else></span>
            <button
              v-if="c.status === 'DRAFT'"
              class="text-xs text-electric font-medium"
              :disabled="sendingId === c.id"
              @click="sendCampaign(c.id)"
            >
              {{ sendingId === c.id ? 'Sending…' : 'Send now' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
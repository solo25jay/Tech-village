<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { auditApi, type AuditLogRow } from '@/services/audit.api';

const logs = ref<AuditLogRow[]>([]);
const loading = ref(true);
const error = ref('');
const entityFilter = ref('');

const entities = ['User', 'MentorProfile', 'ProfessionalProfile', 'Certificate', 'EmailCampaign', 'PlatformSetting'];

async function load() {
  loading.value = true;
  try {
    const { data } = await auditApi.list(entityFilter.value ? { entity: entityFilter.value } : undefined);
    logs.value = data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load audit logs';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Audit logs</h1>
    <p class="text-sm text-slate-500">
      Records of state-changing admin actions: role assignments, account status changes, mentor approvals,
      professional qualification changes, and certificate issuance.
    </p>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div class="tv-card">
      <div class="flex gap-2 mb-4">
        <select v-model="entityFilter" class="tv-input !w-auto" @change="load">
          <option value="">All entities</option>
          <option v-for="e in entities" :key="e" :value="e">{{ e }}</option>
        </select>
      </div>

      <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
      <p v-else-if="logs.length === 0" class="text-sm text-slate-500">No audit events yet.</p>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-400 border-b border-slate-100">
            <th class="py-2 font-medium">Action</th>
            <th class="py-2 font-medium">Entity</th>
            <th class="py-2 font-medium">Actor</th>
            <th class="py-2 font-medium">When</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id" class="border-b border-slate-50">
            <td class="py-2">
              <span class="tv-badge bg-surface-light text-navy border border-slate-200">{{ log.action }}</span>
            </td>
            <td class="py-2 text-slate-500">{{ log.entity }}{{ log.entityId ? ` #${log.entityId.slice(0, 8)}` : '' }}</td>
            <td class="py-2 text-slate-500">
              {{ log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : 'System' }}
            </td>
            <td class="py-2 text-slate-400">{{ new Date(log.createdAt).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
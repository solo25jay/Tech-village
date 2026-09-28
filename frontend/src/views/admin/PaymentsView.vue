<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { adminPaymentsApi, type Payment } from '@/services/payments.api';

const payments = ref<Payment[]>([]);
const totalRevenueKobo = ref(0);
const loading = ref(true);
const error = ref('');

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-600',
  SUCCESS: 'bg-green-50 text-green-600',
  FAILED: 'bg-red-50 text-red-600',
};

function formatAmount(kobo: number, currency: string) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(kobo / 100);
}

async function load() {
  loading.value = true;
  try {
    const [paymentsRes, revenueRes] = await Promise.all([
      adminPaymentsApi.listAll(),
      adminPaymentsApi.revenueSummary(),
    ]);
    payments.value = paymentsRes.data.data;
    totalRevenueKobo.value = revenueRes.data.data.totalRevenueKobo;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load payments';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Payments</h1>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div class="tv-card max-w-xs">
      <div class="text-xs text-slate-500">Total revenue (successful payments)</div>
      <div class="text-2xl font-bold text-navy mt-1">{{ formatAmount(totalRevenueKobo, 'NGN') }}</div>
    </div>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">All transactions</h2>
      <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
      <p v-else-if="payments.length === 0" class="text-sm text-slate-500">No payments yet.</p>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-400 border-b border-slate-100">
            <th class="py-2 font-medium">User</th>
            <th class="py-2 font-medium">Purpose</th>
            <th class="py-2 font-medium">Amount</th>
            <th class="py-2 font-medium">Provider</th>
            <th class="py-2 font-medium">Status</th>
            <th class="py-2 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in payments" :key="p.id" class="border-b border-slate-50">
            <td class="py-2">{{ p.user?.firstName }} {{ p.user?.lastName }}</td>
            <td class="py-2 text-slate-500">{{ p.purpose }}</td>
            <td class="py-2">{{ formatAmount(p.amountKobo, p.currency) }}</td>
            <td class="py-2 text-slate-500 capitalize">{{ p.provider }}</td>
            <td class="py-2">
              <span class="tv-badge" :class="statusStyles[p.status]">{{ p.status }}</span>
            </td>
            <td class="py-2 text-slate-500">{{ new Date(p.createdAt).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
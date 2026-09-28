<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { adminUsersApi, type AdminUserRow, type RoleRow } from '@/services/admin-users.api';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();

const users = ref<AdminUserRow[]>([]);
const roles = ref<RoleRow[]>([]);
const loading = ref(true);
const error = ref('');
const search = ref('');
const roleToAssign = reactive<Record<string, string>>({});

const statusStyles: Record<string, string> = {
  PENDING_VERIFICATION: 'bg-amber-50 text-amber-600',
  ACTIVE: 'bg-green-50 text-green-600',
  SUSPENDED: 'bg-red-50 text-red-600',
  DEACTIVATED: 'bg-slate-100 text-slate-500',
};

async function load() {
  loading.value = true;
  try {
    const [usersRes, rolesRes] = await Promise.all([
      adminUsersApi.list(search.value || undefined),
      adminUsersApi.listRoles(),
    ]);
    users.value = usersRes.data.data;
    roles.value = rolesRes.data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load users';
  } finally {
    loading.value = false;
  }
}

async function toggleStatus(user: AdminUserRow) {
  const next = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
  try {
    await adminUsersApi.setStatus(user.id, next);
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to update status';
  }
}

async function assignRole(user: AdminUserRow) {
  const roleName = roleToAssign[user.id];
  if (!roleName) return;
  try {
    await adminUsersApi.assignRole(user.id, roleName);
    roleToAssign[user.id] = '';
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to assign role';
  }
}

async function removeRole(user: AdminUserRow, roleName: string) {
  try {
    await adminUsersApi.removeRole(user.id, roleName);
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to remove role';
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Users</h1>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div class="tv-card">
      <form class="flex gap-2" @submit.prevent="load">
        <input v-model="search" placeholder="Search by name or email" class="tv-input flex-1" />
        <button type="submit" class="tv-btn-secondary text-sm">Search</button>
      </form>
    </div>

    <div class="tv-card">
      <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
      <p v-else-if="users.length === 0" class="text-sm text-slate-500">No users found.</p>

      <div v-else class="space-y-3">
        <div v-for="user in users" :key="user.id" class="rounded-lg border border-slate-100 p-3">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-navy">
                {{ user.firstName }} {{ user.lastName }}
                <span v-if="user.id === auth.user?.id" class="text-xs text-slate-400">(you)</span>
              </div>
              <div class="text-xs text-slate-400">{{ user.email }}</div>
            </div>
            <div class="flex items-center gap-2">
              <span class="tv-badge" :class="statusStyles[user.status]">{{ user.status }}</span>
              <button
                v-if="user.id !== auth.user?.id"
                class="text-xs text-electric font-medium"
                @click="toggleStatus(user)"
              >
                {{ user.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend' }}
              </button>
            </div>
          </div>

          <div class="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              v-for="ur in user.roles"
              :key="ur.role.id"
              class="tv-badge bg-surface-light text-navy border border-slate-200 flex items-center gap-1"
            >
              {{ ur.role.name }}
              <button
                v-if="!(user.id === auth.user?.id && ['admin', 'super_admin'].includes(ur.role.name))"
                class="text-slate-400 hover:text-red-500"
                @click="removeRole(user, ur.role.name)"
              >
                ×
              </button>
            </span>

            <select v-model="roleToAssign[user.id]" class="tv-input text-xs !py-1 !w-auto ml-1">
              <option value="">+ Add role</option>
              <option v-for="r in roles" :key="r.id" :value="r.name">{{ r.name }}</option>
            </select>
            <button class="text-xs text-electric font-medium" @click="assignRole(user)">Add</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { homeFor } from '@/router';

const auth = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function onSubmit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    router.push(homeFor(auth.primaryRole));
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to sign in';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <h1 class="text-lg font-semibold text-navy">Welcome back</h1>

    <div>
      <label class="text-sm text-slate-600">Email</label>
      <input v-model="email" type="email" required class="tv-input mt-1" placeholder="you@example.com" />
    </div>

    <div>
      <label class="text-sm text-slate-600">Password</label>
      <input v-model="password" type="password" required class="tv-input mt-1" placeholder="••••••••" />
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <button type="submit" class="tv-btn-primary w-full" :disabled="loading">
      {{ loading ? 'Signing in…' : 'Sign in' }}
    </button>

    <p class="text-sm text-center text-slate-500">
      No account?
      <router-link to="/register" class="text-electric font-medium">Create one</router-link>
    </p>
  </form>
</template>
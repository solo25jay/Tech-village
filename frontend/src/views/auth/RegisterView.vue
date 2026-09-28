<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authApi } from '@/services/auth.api';

const router = useRouter();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const success = ref(false);
const loading = ref(false);

async function onSubmit() {
  error.value = '';
  loading.value = true;
  try {
    await authApi.register({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
    });
    success.value = true;
    setTimeout(() => router.push('/login'), 1500);
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to create account';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form v-if="!success" class="space-y-4" @submit.prevent="onSubmit">
    <h1 class="text-lg font-semibold text-navy">Create your account</h1>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-sm text-slate-600">First name</label>
        <input v-model="firstName" required class="tv-input mt-1" />
      </div>
      <div>
        <label class="text-sm text-slate-600">Last name</label>
        <input v-model="lastName" required class="tv-input mt-1" />
      </div>
    </div>

    <div>
      <label class="text-sm text-slate-600">Email</label>
      <input v-model="email" type="email" required class="tv-input mt-1" />
    </div>

    <div>
      <label class="text-sm text-slate-600">Password</label>
      <input v-model="password" type="password" required minlength="8" class="tv-input mt-1" />
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <button type="submit" class="tv-btn-primary w-full" :disabled="loading">
      {{ loading ? 'Creating account…' : 'Create account' }}
    </button>

    <p class="text-sm text-center text-slate-500">
      Already have an account?
      <router-link to="/login" class="text-electric font-medium">Sign in</router-link>
    </p>
  </form>

  <div v-else class="text-center py-6">
    <p class="text-green-600 font-medium">Account created — check your email to verify.</p>
    <p class="text-sm text-slate-500 mt-1">Redirecting you to sign in…</p>
  </div>
</template>
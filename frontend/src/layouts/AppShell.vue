<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import type { NavItem } from '@/types/nav';

defineProps<{
  navItems: NavItem[];
  portalLabel: string;
}>();

const auth = useAuthStore();
</script>

<template>
  <div class="min-h-screen flex bg-surface-light">
    <aside class="w-64 shrink-0 bg-navy text-white flex flex-col">
      <div class="px-5 py-5 border-b border-white/10">
        <div class="text-lg font-bold bg-gradient-cyan-teal bg-clip-text text-transparent">
          TECH VILLAGE
        </div>
        <div class="text-xs text-white/50 mt-0.5">{{ portalLabel }}</div>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition"
          active-class="bg-white/10 text-white"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="px-3 py-4 border-t border-white/10">
        <button
          class="w-full text-left rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
          @click="auth.logout()"
        >
          Sign out
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-16 bg-white border-b border-slate-100 flex items-center justify-end px-6 gap-3">
        <span class="text-sm text-slate-500">{{ auth.user?.firstName }} {{ auth.user?.lastName }}</span>
        <div
          class="h-9 w-9 rounded-full bg-gradient-purple-blue flex items-center justify-center text-white text-sm font-semibold"
        >
          {{ auth.user?.firstName?.[0] }}{{ auth.user?.lastName?.[0] }}
        </div>
      </header>

      <main class="flex-1 p-6 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

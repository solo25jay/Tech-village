<template>
  <div class="min-h-screen bg-surface-light flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div
          class="inline-block text-2xl font-bold bg-gradient-purple-blue bg-clip-text text-transparent"
        >
          TECH VILLAGE
        </div>
        <p class="text-sm text-slate-500 mt-1">Learn. Build. Earn.</p>
      </div>
      <div class="tv-card">
        <router-view />
      </div>
    </div>
  </div>
</template>

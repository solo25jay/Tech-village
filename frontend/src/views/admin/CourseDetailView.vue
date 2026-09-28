<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { adminLearningApi, type CourseDetail } from '@/services/learning.api';

const route = useRoute();
const courseId = route.params.id as string;

const course = ref<CourseDetail | null>(null);
const loading = ref(true);
const error = ref('');

const moduleForm = reactive({ title: '' });
const addingModule = ref(false);

const lessonForms = reactive<Record<string, { title: string; contentType: 'VIDEO' | 'TEXT' | 'RESOURCE'; contentUrl: string }>>({});
const addingLessonForModule = ref<string | null>(null);

async function load() {
  loading.value = true;
  try {
    const { data } = await adminLearningApi.getCourse(courseId);
    course.value = data.data;
    for (const mod of data.data.modules) {
      lessonForms[mod.id] ??= { title: '', contentType: 'VIDEO', contentUrl: '' };
    }
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load course';
  } finally {
    loading.value = false;
  }
}

async function addModule() {
  if (!course.value) return;
  addingModule.value = true;
  try {
    const order = course.value.modules.length;
    await adminLearningApi.createModule({ courseId, title: moduleForm.title, order });
    moduleForm.title = '';
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to add module';
  } finally {
    addingModule.value = false;
  }
}

async function addLesson(moduleId: string) {
  if (!course.value) return;
  const mod = course.value.modules.find((m) => m.id === moduleId);
  if (!mod) return;
  const form = lessonForms[moduleId];

  addingLessonForModule.value = moduleId;
  try {
    await adminLearningApi.createLesson({
      moduleId,
      title: form.title,
      contentType: form.contentType,
      contentUrl: form.contentUrl || undefined,
      order: mod.lessons.length,
    });
    form.title = '';
    form.contentUrl = '';
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to add lesson';
  } finally {
    addingLessonForModule.value = null;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
    <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

    <template v-else-if="course">
      <div>
        <h1 class="text-xl font-semibold text-navy">{{ course.title }}</h1>
        <p class="text-sm text-slate-500 mt-1">{{ course.description }}</p>
      </div>

      <div v-for="mod in course.modules" :key="mod.id" class="tv-card">
        <h2 class="font-semibold text-navy mb-3">{{ mod.title }}</h2>

        <ul class="divide-y divide-slate-100 mb-4">
          <li v-for="lesson in mod.lessons" :key="lesson.id" class="py-2 text-sm flex items-center justify-between">
            <span class="text-slate-700">{{ lesson.title }}</span>
            <span class="tv-badge bg-surface-light text-navy border border-slate-200">{{ lesson.contentType }}</span>
          </li>
          <li v-if="mod.lessons.length === 0" class="py-2 text-sm text-slate-400">No lessons yet.</li>
        </ul>

        <form
          v-if="lessonForms[mod.id]"
          class="grid grid-cols-1 md:grid-cols-4 gap-2"
          @submit.prevent="addLesson(mod.id)"
        >
          <input v-model="lessonForms[mod.id].title" required placeholder="Lesson title" class="tv-input md:col-span-2" />
          <select v-model="lessonForms[mod.id].contentType" class="tv-input">
            <option value="VIDEO">Video</option>
            <option value="TEXT">Text</option>
            <option value="RESOURCE">Resource</option>
          </select>
          <input v-model="lessonForms[mod.id].contentUrl" placeholder="Content URL (optional)" class="tv-input" />
          <button type="submit" class="tv-btn-secondary md:col-span-4 text-sm" :disabled="addingLessonForModule === mod.id">
            {{ addingLessonForModule === mod.id ? 'Adding…' : '+ Add lesson' }}
          </button>
        </form>
      </div>

      <div class="tv-card">
        <h2 class="font-semibold text-navy mb-3">Add a module</h2>
        <form class="flex gap-2" @submit.prevent="addModule">
          <input v-model="moduleForm.title" required placeholder="Module title" class="tv-input flex-1" />
          <button type="submit" class="tv-btn-primary" :disabled="addingModule">
            {{ addingModule ? 'Adding…' : 'Add module' }}
          </button>
        </form>
      </div>
    </template>
  </div>
</template>
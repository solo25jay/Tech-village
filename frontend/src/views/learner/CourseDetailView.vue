<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { learningApi, type CourseDetail } from '@/services/learning.api';

const route = useRoute();
const courseId = route.params.courseId as string;

const course = ref<CourseDetail | null>(null);
const loading = ref(true);
const error = ref('');
const togglingLessonId = ref<string | null>(null);

const allLessons = computed(() => course.value?.modules.flatMap((m) => m.lessons) ?? []);
const completedCount = computed(() => allLessons.value.filter((l) => l.completed).length);
const progressPercent = computed(() =>
  allLessons.value.length ? Math.round((completedCount.value / allLessons.value.length) * 100) : 0,
);

async function load() {
  loading.value = true;
  try {
    const { data } = await learningApi.getCourse(courseId);
    course.value = data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load course';
  } finally {
    loading.value = false;
  }
}

async function toggleLesson(lessonId: string, currentlyCompleted: boolean) {
  togglingLessonId.value = lessonId;
  try {
    await learningApi.setLessonProgress(courseId, lessonId, !currentlyCompleted);
    const lesson = allLessons.value.find((l) => l.id === lessonId);
    if (lesson) lesson.completed = !currentlyCompleted;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to update progress';
  } finally {
    togglingLessonId.value = null;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-4">
    <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
    <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

    <template v-else-if="course">
      <div>
        <h1 class="text-xl font-semibold text-navy">{{ course.title }}</h1>
        <p class="text-sm text-slate-500 mt-1">{{ course.description }}</p>
      </div>

      <div class="tv-card">
        <div class="flex items-center justify-between text-sm mb-2">
          <span class="text-slate-600">Progress</span>
          <span class="text-slate-500">{{ completedCount }} / {{ allLessons.length }} lessons</span>
        </div>
        <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div class="h-full bg-gradient-blue-cyan" :style="{ width: progressPercent + '%' }" />
        </div>
      </div>

      <div v-for="mod in course.modules" :key="mod.id" class="tv-card">
        <h2 class="font-semibold text-navy mb-3">{{ mod.title }}</h2>
        <ul class="divide-y divide-slate-100">
          <li
            v-for="lesson in mod.lessons"
            :key="lesson.id"
            class="py-3 flex items-center justify-between gap-3"
          >
            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                class="accent-electric"
                :checked="lesson.completed"
                :disabled="togglingLessonId === lesson.id"
                @change="toggleLesson(lesson.id, Boolean(lesson.completed))"
              />
              <div>
                <div :class="lesson.completed ? 'line-through text-slate-400' : 'text-slate-700'" class="text-sm">
                  {{ lesson.title }}
                </div>
                <div class="text-xs text-slate-400">{{ lesson.contentType }}</div>
              </div>
            </div>
            <a
              v-if="lesson.contentUrl"
              :href="lesson.contentUrl"
              target="_blank"
              rel="noopener"
              class="text-xs text-electric font-medium"
              >Open</a
            >
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
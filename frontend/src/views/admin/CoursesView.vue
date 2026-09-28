<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { adminLearningApi, type CourseSummary, type LearningPath } from '@/services/learning.api';

const courses = ref<CourseSummary[]>([]);
const paths = ref<LearningPath[]>([]);
const loading = ref(true);
const error = ref('');
const creating = ref(false);

const form = reactive({
  title: '',
  description: '',
  learningPathId: '',
});

async function load() {
  loading.value = true;
  try {
    const [coursesRes, pathsRes] = await Promise.all([
      adminLearningApi.listCourses(),
      adminLearningApi.listPaths(),
    ]);
    courses.value = coursesRes.data.data;
    paths.value = pathsRes.data.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load courses';
  } finally {
    loading.value = false;
  }
}

async function createCourse() {
  creating.value = true;
  error.value = '';
  try {
    await adminLearningApi.createCourse({
      title: form.title,
      description: form.description,
      learningPathId: form.learningPathId || undefined,
    });
    form.title = '';
    form.description = '';
    form.learningPathId = '';
    await load();
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to create course';
  } finally {
    creating.value = false;
  }
}

async function togglePublish(course: CourseSummary) {
  await adminLearningApi.publishCourse(course.id, !course.isPublished);
  await load();
}

onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-navy">Courses</h1>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">Create a course</h2>
      <form class="grid grid-cols-1 md:grid-cols-2 gap-3" @submit.prevent="createCourse">
        <input v-model="form.title" required placeholder="Course title" class="tv-input" />
        <select v-model="form.learningPathId" class="tv-input">
          <option value="">No learning path</option>
          <option v-for="path in paths" :key="path.id" :value="path.id">{{ path.name }}</option>
        </select>
        <textarea
          v-model="form.description"
          required
          placeholder="Description"
          rows="2"
          class="tv-input md:col-span-2"
        />
        <button type="submit" class="tv-btn-primary md:col-span-2" :disabled="creating">
          {{ creating ? 'Creating…' : 'Create course' }}
        </button>
      </form>
      <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>
      <p class="text-xs text-slate-400 mt-2">
        Click a course below, or "Manage", to add modules and lessons.
      </p>
    </div>

    <div class="tv-card">
      <h2 class="font-semibold text-navy mb-3">All courses</h2>
      <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-400 border-b border-slate-100">
            <th class="py-2 font-medium">Title</th>
            <th class="py-2 font-medium">Learning path</th>
            <th class="py-2 font-medium">Status</th>
            <th class="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in courses" :key="course.id" class="border-b border-slate-50">
            <td class="py-2">
              <router-link :to="`/admin/courses/${course.id}`" class="text-navy hover:text-electric">
                {{ course.title }}
              </router-link>
            </td>
            <td class="py-2">{{ course.learningPath?.name ?? '—' }}</td>
            <td class="py-2">
              <span
                class="tv-badge"
                :class="course.isPublished ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'"
              >
                {{ course.isPublished ? 'Published' : 'Draft' }}
              </span>
            </td>
            <td class="py-2 space-x-3">
              <router-link :to="`/admin/courses/${course.id}`" class="text-electric text-xs font-medium">
                Manage
              </router-link>
              <button class="text-electric text-xs font-medium" @click="togglePublish(course)">
                {{ course.isPublished ? 'Unpublish' : 'Publish' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
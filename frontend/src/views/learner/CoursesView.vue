<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { learningApi, type CourseSummary, type Enrollment } from '@/services/learning.api';

const router = useRouter();

const courses = ref<CourseSummary[]>([]);
const enrolledCourseIds = ref<Set<string>>(new Set());
const loading = ref(true);
const error = ref('');
const enrollingId = ref<string | null>(null);

async function load() {
  loading.value = true;
  try {
    const [coursesRes, enrollmentsRes] = await Promise.all([
      learningApi.listCourses(),
      learningApi.myEnrollments(),
    ]);
    courses.value = coursesRes.data.data;
    enrolledCourseIds.value = new Set(enrollmentsRes.data.data.map((e: Enrollment) => e.courseId));
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to load courses';
  } finally {
    loading.value = false;
  }
}

async function enroll(courseId: string) {
  enrollingId.value = courseId;
  try {
    await learningApi.enroll(courseId);
    enrolledCourseIds.value.add(courseId);
    router.push(`/app/courses/${courseId}`);
  } catch (e: any) {
    error.value = e?.response?.data?.error?.message ?? 'Unable to enroll';
  } finally {
    enrollingId.value = null;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-semibold text-navy">Courses</h1>

    <p v-if="loading" class="text-sm text-slate-500">Loading…</p>
    <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-else-if="courses.length === 0" class="text-sm text-slate-500">No courses published yet.</p>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="course in courses" :key="course.id" class="tv-card flex flex-col">
        <div
          class="h-28 rounded-lg bg-gradient-purple-blue mb-3"
          :style="course.thumbnailUrl ? { backgroundImage: `url(${course.thumbnailUrl})`, backgroundSize: 'cover' } : {}"
        />
        <h2 class="font-semibold text-navy">{{ course.title }}</h2>
        <p v-if="course.learningPath" class="text-xs text-electric mt-0.5">{{ course.learningPath.name }}</p>
        <p class="text-sm text-slate-500 mt-2 line-clamp-2 flex-1">{{ course.description }}</p>

        <router-link
          v-if="enrolledCourseIds.has(course.id)"
          :to="`/app/courses/${course.id}`"
          class="tv-btn-secondary mt-4 text-sm"
        >
          Continue learning
        </router-link>
        <button
          v-else
          class="tv-btn-primary mt-4 text-sm"
          :disabled="enrollingId === course.id"
          @click="enroll(course.id)"
        >
          {{ enrollingId === course.id ? 'Enrolling…' : 'Enroll' }}
        </button>
      </div>
    </div>
  </div>
</template>
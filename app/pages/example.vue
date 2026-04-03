<template>
  <div class="page">
    <h1>{{ heading }}</h1>

    <Card class="card--panel">
      <ProgressDashboardPanel :data="mockData" />
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { ProgressJson } from '#shared/types/progress'

const START_OFFSET_MS = (6 * 60 * 60 + 6 * 60 + 6) * 1000
const DEFAULT_TOTAL = 69420
const DEFAULT_COMPLETED = 2137
const DEFAULT_NAME = 'example'

const route = useRoute()

const queryInt = (raw: unknown, fallback: number): number => {
  const s = Array.isArray(raw) ? raw[0] : raw
  if (s === undefined || s === null || s === '') {
    return fallback
  }
  const n = Number.parseInt(String(s), 10)
  return Number.isFinite(n) ? n : fallback
}

const mockData = computed<ProgressJson>(() => {
  let total = queryInt(route.query.total, DEFAULT_TOTAL)
  let completed = queryInt(route.query.completed, DEFAULT_COMPLETED)
  total = Math.max(1, total)
  completed = Math.min(Math.max(0, completed), total)

  const now = Date.now()

  return {
    id: 'example',
    completed,
    total,
    startTime: new Date(now - START_OFFSET_MS).toISOString(),
    updatedAt: new Date(now).toISOString(),
    name: DEFAULT_NAME,
  }
})

const heading = computed(() => progressTitleFromData(mockData.value))
</script>

<style scoped>
.page {
  max-width: 980px;
  margin: 40px auto;
  padding: 18px;
  color: rgba(255, 255, 255, 0.92);
  min-height: 60vh;
  background: radial-gradient(1200px 600px at 20% 0%, rgba(59, 130, 246, 0.25), transparent 45%),
    radial-gradient(900px 500px at 100% 30%, rgba(34, 197, 94, 0.18), transparent 40%),
    rgba(11, 18, 32, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
}

h1 {
  margin: 0 0 16px;
  font-size: 28px;
  letter-spacing: -0.02em;
  text-align: center;
}

.card--panel {
  margin-top: 14px;
}
</style>

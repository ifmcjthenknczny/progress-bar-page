<template>
  <div class="page">
    <h1>Progress</h1>

    <div v-if="error" class="card card--error">
      <div class="card__title">Failed to load data</div>
      <div class="card__body">{{ error }}</div>
    </div>

    <div v-else-if="!id" class="card">
      <div class="card__title">Missing query parameter</div>
      <div class="card__body">
        Open <code>/?id=&lt;uuid&gt;</code>
      </div>
    </div>

    <div v-else-if="!data" class="card">
      <div class="card__title">Loading...</div>
      <div class="card__body">Fetching progress state from the database.</div>
    </div>

    <div v-else class="card">
      <div class="row row--between row--wrap">
        <div>
          <div class="label">Processed</div>
          <div class="value">
            {{ data.completed }} / {{ data.total }}
          </div>
        </div>

        <div class="stat">
          <div class="label">Remaining</div>
          <div class="value">
            {{ remainingItems }} / {{ data.total }}
          </div>
        </div>
      </div>

      <div class="bar">
        <div class="bar__track" aria-hidden="true">
          <div class="bar__fill" :style="{ width: `${progressPercent}%` }" />
          <div class="bar__shine" />
        </div>
        <div class="bar__meta">
          <div class="bar__scale">0%</div>
          <div class="bar__percent">{{ progressPercent.toFixed(1) }}%</div>
          <div class="bar__scale">100%</div>
        </div>
      </div>

      <div class="grid">
        <div class="cell">
          <div class="label">Average time / item</div>
          <div class="value" v-if="avgPerItemMs !== null">{{ formatDuration(avgPerItemMs) }}</div>
          <div class="value value--muted" v-else>—</div>
        </div>

        <div class="cell">
          <div class="label">ETA (remaining duration)</div>
          <div class="value" v-if="etaMs !== null">{{ formatDuration(etaMs) }}</div>
          <div class="value value--muted" v-else>—</div>
        </div>

        <div class="cell">
          <div class="label">Due time</div>
          <div class="value" v-if="etaDueAt">{{ formatDateTime(etaDueAt) }}</div>
          <div class="value value--muted" v-else>—</div>
        </div>
      </div>

      <div class="divider" />

      <div class="row row--between row--wrap">
        <div class="small">
          <span class="small__k">Start time:</span>
          <span class="value value--mono">{{ formatDateTime(data.startTime) }}</span>
        </div>
        <div class="small">
          <span class="small__k">Updated at:</span>
          <span class="value value--mono">{{ updatedAtDate ? formatDateTime(updatedAtDate) : '—' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { PROGRESS_REFRESH_INTERVAL_MS } from '#shared/config'
import type { ProgressJson } from '#shared/types/progress'

const route = useRoute()
const id = computed(() => {
  const raw = route.query.id
  if (typeof raw === 'string') {
    return raw
  }
  if (Array.isArray(raw)) {
    return raw[0] ?? ''
  }
  return ''
})

const data = ref<ProgressJson | null>(null)
const error = ref<string | null>(null)

let timer: ReturnType<typeof setInterval> | null = null

const load = async () => {
  if (!id.value) {
    return
  }

  error.value = null
  try {
    const res = await $fetch<ProgressJson>(`/api/progress/${encodeURIComponent(id.value)}`)
    data.value = res
  } catch (e: any) {
    data.value = null
    error.value = e?.data?.statusMessage ?? e?.message ?? 'Unknown error'
  }
}

const startPolling = () => {
  if (timer) clearInterval(timer)
  if (!id.value) {
    return
  }

  void load()
  timer = setInterval(() => void load(), PROGRESS_REFRESH_INTERVAL_MS)
}

onMounted(() => {
  startPolling()
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

watch(id, () => {
  data.value = null
  error.value = null
  startPolling()
})

const toDate = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

const startDate = computed(() => {
  return data.value ? toDate(data.value.startTime) : null
})

const updatedAtDate = computed(() => {
  return data.value ? toDate(data.value.updatedAt) : null
})

const startTimeMs = computed(() => {
  return startDate.value ? startDate.value.getTime() : null
})

const remainingItems = computed(() => {
  return data.value ? Math.max(0, data.value.total - data.value.completed) : 0
})

const progressPercent = computed(() => {
  if (!data.value || data.value.total <= 0) {
    return 0
  }
  const raw = (data.value.completed / data.value.total) * 100
  return Math.min(100, Math.max(0, raw))
})

const avgPerItemMs = computed(() => {
  if (!data.value || data.value.completed <= 0 || startTimeMs.value === null) {
    return null
  }
  const elapsedMs = Date.now() - startTimeMs.value
  if (elapsedMs < 0) {
    return null
  }
  return elapsedMs / data.value.completed
})

const etaMs = computed(() => {
  if (!data.value || remainingItems.value <= 0 || avgPerItemMs.value === null) {
    return null
  }
  return avgPerItemMs.value * remainingItems.value
})

const etaDueAt = computed(() => {
  return etaMs.value === null ? null : new Date(Date.now() + etaMs.value)
})

const formatDuration = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const sec = totalSeconds % 60
  const min = Math.floor(totalSeconds / 60) % 60
  const hrs = Math.floor(totalSeconds / 3600)

  if (hrs > 0) {
    return `${hrs}h ${min}m ${sec}s`
  }
  if (min > 0) {
    return `${min}m ${sec}s`
  }
  return `${sec}s`
}

const formatDateTime = (value: string | Date) => {
  const d = toDate(value)
  if (!d) {
    return '—'
  }
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d)
}
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

.card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 18px;
  backdrop-filter: blur(10px);
}

.card--error {
  background: rgba(255, 0, 64, 0.08);
  border-color: rgba(255, 0, 64, 0.25);
}

.card__title {
  font-weight: 700;
  margin-bottom: 8px;
}

.card__body {
  color: rgba(255, 255, 255, 0.85);
}

.row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.row--between {
  justify-content: space-between;
}

.row--wrap {
  flex-wrap: wrap;
}

.bar {
  margin-top: 14px;
}

.bar__track {
  position: relative;
  height: 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.26);
  box-sizing: border-box;
  overflow: hidden;
}

.bar__fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #22c55e 0%, #3b82f6 100%);
  box-shadow: 0 0 18px rgba(59, 130, 246, 0.35);
  transition: width 300ms ease;
}

.bar__shine {
  position: absolute;
  top: -40%;
  left: -20%;
  width: 60%;
  height: 180%;
  transform: rotate(12deg);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.18) 50%, rgba(255, 255, 255, 0) 100%);
  animation: shine 1.4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes shine {
  0% {
    transform: translateX(-40%) rotate(12deg);
    opacity: 0.1;
  }
  50% {
    opacity: 0.35;
  }
  100% {
    transform: translateX(160%) rotate(12deg);
    opacity: 0.1;
  }
}

.bar__meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.bar__percent {
  font-weight: 800;
  letter-spacing: -0.02em;
}

.bar__scale {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 700;
}

.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 16px;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.cell {
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 6px;
}

.value {
  font-size: 18px;
  font-weight: 800;
}

.value--muted {
  color: rgba(255, 255, 255, 0.45);
  font-weight: 700;
}

.value--mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-weight: 700;
}

.stat {
  min-width: 160px;
  text-align: right;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 16px 0;
}

.small {
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
}

.small__k {
  display: inline-block;
  width: 140px;
  color: rgba(255, 255, 255, 0.55);
}
</style>


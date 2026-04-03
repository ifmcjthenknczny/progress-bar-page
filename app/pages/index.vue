<template>
  <div class="page">
    <h1>{{ progressHeading }}</h1>

    <Card v-if="error" error>
      <div class="card__title">Failed to load data</div>
      <div class="card__body">{{ error }}</div>
    </Card>

    <Card v-else-if="!id">
      <div class="card__title">Missing query parameter</div>
      <div class="card__body">
        Open <code>/?id=&lt;uuid&gt;</code>
      </div>
    </Card>

    <Card v-else-if="!data">
      <div class="card__title">Loading...</div>
      <div class="card__body">Fetching progress state from the database.</div>
    </Card>

    <Card v-else>
      <div class="row row--between row--wrap">
        <Stat label="Processed">
          {{ data.completed }} / {{ data.total }}
        </Stat>

        <Stat label="Remaining" align-end>
          {{ remainingItems }} / {{ data.total }}
        </Stat>
      </div>

      <Bar :percent="progressPercent" />

      <div class="grid">
        <Cell>
          <template #label>Running time</template>
          <div class="value" v-if="runningTimeMs !== null">{{ formatDuration(runningTimeMs) }}</div>
          <div class="value value--muted" v-else>—</div>
        </Cell>

        <Cell>
          <template #label>Average time / item</template>
          <div class="value" v-if="avgPerItemMs !== null">{{ formatAvgPerItemSec(avgPerItemMs) }}</div>
          <div class="value value--muted" v-else>—</div>
        </Cell>

        <Cell>
          <template #label>ETA (remaining duration)</template>
          <div class="value" v-if="etaMs !== null">{{ formatDuration(etaMs) }}</div>
          <div class="value value--muted" v-else>—</div>
        </Cell>

        <Cell>
          <template #label>Due time</template>
          <div class="value" v-if="etaDueAt">{{ formatDateTime(etaDueAt) }}</div>
          <div class="value value--muted" v-else>—</div>
        </Cell>
      </div>

      <div class="divider" />

      <div class="row row--between row--wrap">
        <Small label="Start time:">{{ formatDateTime(data.startTime) }}</Small>
        <Small label="Last updated at:">{{ updatedAtDate ? formatDateTime(updatedAtDate) : '—' }}</Small>
      </div>

    </Card>
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

const progressHeading = computed(() => {
  const n = data.value?.name?.trim()
  return n ? `Progress of ${n}` : 'Progress'
})

let timer: ReturnType<typeof setInterval> | null = null
let clockTimer: ReturnType<typeof setInterval> | null = null

const nowMs = ref(Date.now())

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
  if (timer) {
    clearInterval(timer)
  }
  if (!id.value) {
    return
  }

  void load()
  timer = setInterval(() => void load(), PROGRESS_REFRESH_INTERVAL_MS)
}

onMounted(() => {
  startPolling()
  clockTimer = setInterval(() => {
    nowMs.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
  if (clockTimer) {
    clearInterval(clockTimer)
  }
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

const elapsedMsToUpdatedAt = computed(() => {
  if (startTimeMs.value === null || !updatedAtDate.value) {
    return null
  }
  const end = updatedAtDate.value.getTime()
  const elapsed = end - startTimeMs.value
  return elapsed >= 0 ? elapsed : null
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
  if (!data.value || data.value.completed <= 0 || elapsedMsToUpdatedAt.value === null) {
    return null
  }
  return elapsedMsToUpdatedAt.value / data.value.completed
})

const etaMs = computed(() => {
  if (!data.value || remainingItems.value <= 0 || avgPerItemMs.value === null) {
    return null
  }
  return avgPerItemMs.value * remainingItems.value
})

const etaDueAt = computed(() => {
  if (etaMs.value === null || !updatedAtDate.value) {
    return null
  }
  return new Date(updatedAtDate.value.getTime() + etaMs.value)
})

const jobComplete = computed(() => {
  if (!data.value || data.value.total <= 0) {
    return false
  }
  return data.value.completed >= data.value.total
})

const runningTimeMs = computed(() => {
  if (startTimeMs.value === null) {
    return null
  }
  if (jobComplete.value && elapsedMsToUpdatedAt.value !== null) {
    return elapsedMsToUpdatedAt.value
  }
  const ms = nowMs.value - startTimeMs.value
  return ms >= 0 ? ms : null
})

const formatAvgPerItemSec = (ms: number) => {
  const sec = Math.max(0, ms / 1000)
  return `${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(sec)} s`
}

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

.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 16px 0;
}

.running-time {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.running-time :deep(.cell) {
  max-width: 360px;
  width: 100%;
  text-align: center;
}
</style>

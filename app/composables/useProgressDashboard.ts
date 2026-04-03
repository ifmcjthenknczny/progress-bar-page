import { computed, onBeforeUnmount, onMounted, ref, toValue, type MaybeRefOrGetter } from 'vue'
import type { ProgressJson } from '#shared/types/progress'

export const progressTitleFromData = (d: ProgressJson | null | undefined): string => {
  if (!d) {
    return 'Progress'
  }
  const n = d.name?.trim()
  return n ? `Progress of ${n}` : 'Progress'
}

const toDate = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const dt = new Date(value)
    return Number.isNaN(dt.getTime()) ? null : dt
  }
  return null
}

export const useProgressDashboard = (data: MaybeRefOrGetter<ProgressJson>) => {
  const nowMs = ref(Date.now())
  let clockTimer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    clockTimer = setInterval(() => {
      nowMs.value = Date.now()
    }, 1000)
  })

  onBeforeUnmount(() => {
    if (clockTimer) {
      clearInterval(clockTimer)
    }
  })

  const d = computed(() => toValue(data))

  const startDate = computed(() => toDate(d.value.startTime))
  const updatedAtDate = computed(() => toDate(d.value.updatedAt))
  const startTimeMs = computed(() => (startDate.value ? startDate.value.getTime() : null))

  const elapsedMsToUpdatedAt = computed(() => {
    if (startTimeMs.value === null || !updatedAtDate.value) {
      return null
    }
    const end = updatedAtDate.value.getTime()
    const elapsed = end - startTimeMs.value
    return elapsed >= 0 ? elapsed : null
  })

  const remainingItems = computed(() => Math.max(0, d.value.total - d.value.completed))

  const progressPercent = computed(() => {
    if (d.value.total <= 0) {
      return 0
    }
    const raw = (d.value.completed / d.value.total) * 100
    return Math.min(100, Math.max(0, raw))
  })

  const avgPerItemMs = computed(() => {
    if (d.value.completed <= 0 || elapsedMsToUpdatedAt.value === null) {
      return null
    }
    return elapsedMsToUpdatedAt.value / d.value.completed
  })

  const etaMs = computed(() => {
    if (remainingItems.value <= 0 || avgPerItemMs.value === null) {
      return null
    }
    return avgPerItemMs.value * remainingItems.value
  })

  const etaMsLive = computed(() => {
    if (etaMs.value === null) {
      return null
    }
    if (!updatedAtDate.value) {
      return etaMs.value
    }
    const drift = nowMs.value - updatedAtDate.value.getTime()
    return Math.max(0, etaMs.value - drift)
  })

  const etaDueAt = computed(() => {
    if (etaMs.value === null || !updatedAtDate.value) {
      return null
    }
    return new Date(updatedAtDate.value.getTime() + etaMs.value)
  })

  const jobComplete = computed(() => {
    if (d.value.total <= 0) {
      return false
    }
    return d.value.completed >= d.value.total
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
    const dt = toDate(value)
    if (!dt) {
      return '—'
    }
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(dt)
  }

  return {
    d,
    remainingItems,
    progressPercent,
    avgPerItemMs,
    etaMsLive,
    etaDueAt,
    runningTimeMs,
    updatedAtDate,
    formatAvgPerItemSec,
    formatDuration,
    formatDateTime,
  }
}

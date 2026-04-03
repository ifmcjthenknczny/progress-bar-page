<template>
  <div class="page">
    <h1>{{ heading }}</h1>

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
      <ProgressDashboardPanel :data="data" />
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

const heading = computed(() => progressTitleFromData(data.value))

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
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})

watch(id, () => {
  data.value = null
  error.value = null
  startPolling()
})
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
</style>

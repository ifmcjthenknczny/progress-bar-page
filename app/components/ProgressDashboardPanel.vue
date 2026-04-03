<template>
  <div>
    <div class="row row--between row--wrap">
      <Stat label="Processed">
        {{ d.completed }} / {{ d.total }}
      </Stat>

      <Stat label="Remaining" align-end>
        {{ remainingItems }} / {{ d.total }}
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
        <div class="value" v-if="etaMsLive !== null">{{ formatDuration(etaMsLive) }}</div>
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
      <Small label="Start time:">{{ formatDateTime(d.startTime) }}</Small>
      <Small label="Last updated at:">{{ updatedAtDate ? formatDateTime(updatedAtDate) : '—' }}</Small>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProgressJson } from '#shared/types/progress'

const props = defineProps<{
  data: ProgressJson
}>()

const {
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
} = useProgressDashboard(() => props.data)
</script>

<style scoped>
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
</style>

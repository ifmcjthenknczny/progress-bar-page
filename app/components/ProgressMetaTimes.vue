<template>
  <div class="meta-row">
    <div v-for="row in rows" :key="row.label" class="meta-block">
      <span class="meta-label">{{ row.label }}</span>
      <div class="meta-datetime">
        <template v-if="row.parts">
          <span class="meta-date">{{ row.parts.date }}</span>
          <span class="meta-time">{{ row.parts.time }}</span>
        </template>
        <span v-else class="meta-date">—</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type DateTimeParts = { date: string; time: string }

const props = defineProps<{
  startParts: DateTimeParts | null
  updatedParts: DateTimeParts | null
}>()

const rows = computed(() => [
  { label: 'Start time:', parts: props.startParts },
  { label: 'Last updated at:', parts: props.updatedParts },
])
</script>

<style scoped>
.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px 16px;
}

.meta-block {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px 12px;
  min-width: 0;
  flex: 1 1 0;
}

.meta-label {
  flex-shrink: 0;
  padding-top: 2px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
}

.meta-datetime {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.25;
  text-align: right;
}

.meta-date,
.meta-time {
  display: block;
}

.meta-time {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.9;
}

@media (max-width: 639px) {
  .meta-row {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }

  .meta-block {
    flex: none;
    width: 100%;
  }
}

@media (min-width: 640px) {
  .meta-datetime {
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: baseline;
    gap: 0.5em;
    white-space: nowrap;
  }

  .meta-time {
    font-size: inherit;
    font-weight: 700;
    opacity: 1;
  }
}
</style>

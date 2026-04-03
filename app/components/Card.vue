<template>
  <div class="card" :class="{ 'card--error': error }">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  error?: boolean
}>()
</script>

<style scoped>
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

.card :deep(.card__title) {
  font-weight: 700;
  margin-bottom: 8px;
}

.card :deep(.card__body) {
  color: rgba(255, 255, 255, 0.85);
}
</style>

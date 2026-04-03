<template>
  <div class="stat" :class="{ 'stat--end': alignEnd }">
    <div class="label">{{ label }}</div>
    <div class="value">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    alignEnd?: boolean
  }>(),
  { alignEnd: false },
)
</script>

<style scoped>
.label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 6px;
}

.value {
  font-size: 18px;
  font-weight: 800;
}

.stat {
  min-width: 160px;
}

.stat--end {
  text-align: right;
}
</style>

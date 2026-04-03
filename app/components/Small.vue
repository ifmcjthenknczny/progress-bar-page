<template>
  <div class="small">
    <span class="small__k">{{ label }}</span>
    <span class="value value--mono">
      <slot />
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<style scoped>
.small {
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
}

.small__k {
  display: inline-block;
  width: 140px;
  color: rgba(255, 255, 255, 0.55);
}

.value {
  font-size: 18px;
  font-weight: 800;
}

.value--mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
  font-weight: 700;
}
</style>

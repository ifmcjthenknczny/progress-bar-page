<template>
  <div class="cell">
    <div class="label">
      <slot name="label" />
    </div>
    <slot />
  </div>
</template>

<style scoped>
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

.cell :deep(.value) {
  font-size: 18px;
  font-weight: 800;
}

.cell :deep(.value--muted) {
  color: rgba(255, 255, 255, 0.45);
  font-weight: 700;
}
</style>

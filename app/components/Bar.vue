<template>
  <div class="bar">
    <div class="bar__track" aria-hidden="true">
      <div class="bar__fill" :style="{ width: `${clamped}%` }">
        <div class="bar__shine" />
      </div>
    </div>
    <div class="bar__meta">
      <div class="bar__scale">0%</div>
      <div class="bar__percent">{{ clamped.toFixed(1) }}%</div>
      <div class="bar__scale">100%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  percent: number
}>()

const clamped = computed(() => Math.min(100, Math.max(0, props.percent)))
</script>

<style scoped>
.bar {
  margin-top: 14px;
}

.bar__track {
  position: relative;
  height: 18px;
  border-radius: 999px;
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.26);
  box-sizing: border-box;
  overflow: hidden;
}

.bar__fill {
  position: relative;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #22c55e 0%, #3b82f6 100%);
  box-shadow: 0 0 18px rgba(59, 130, 246, 0.35);
  transition: width 300ms ease;
  min-width: 0;
}

.bar__shine {
  position: absolute;
  top: -40%;
  left: -20%;
  width: 60%;
  height: 180%;
  transform: rotate(12deg);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.18) 50%,
    rgba(255, 255, 255, 0) 100%
  );
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
</style>

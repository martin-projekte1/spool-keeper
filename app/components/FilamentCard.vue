<script lang="ts" setup>
defineProps<{
  name: string
  manufacturer: string
  color: string
  colorHex: string
  material: string
  features?: string
  diameter: string
  printTemp: string
  purchased: string
  status: string
  statusColor: "error" | "neutral" | "primary" | "secondary" | "success" | "info" | "warning"
  remaining: string
  imageUrl: string
  imageAlt: string
  spoolCount: number
  totalWeightG: number
  remainingWeightG: number
}>()
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-3">
        <NuxtImg
            :alt="imageAlt"
            :src="imageUrl"
            class="size-14 rounded object-cover"
            format="webp"
            height="56"
            quality="80"
            width="56"
        />
        <div class="flex-1 min-w-0">
          <p class="font-semibold">{{ name }}</p>
          <p class="text-sm text-muted">{{ manufacturer }}</p>
        </div>
        <div class="flex flex-wrap gap-1 shrink-0">
          <UBadge color="neutral" variant="subtle">{{ material }}</UBadge>
          <UBadge v-if="features" color="secondary" variant="subtle">{{ features }}</UBadge>
          <UBadge :color="statusColor" variant="subtle">{{ status }}</UBadge>
        </div>
      </div>
    </template>

    <dl class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
      <dt class="text-muted">Color</dt>
      <dd class="flex items-center gap-2">
        <span
            :style="{ backgroundColor: colorHex }"
            class="inline-block size-3 rounded-full border border-default shrink-0"
        />
        {{ color }}
      </dd>
      <dt class="text-muted">Diameter</dt>
      <dd>{{ diameter }}</dd>
      <dt class="text-muted">Print Temp</dt>
      <dd>{{ printTemp }}</dd>
      <dt class="text-muted">Purchased</dt>
      <dd>{{ purchased }}</dd>
      <dt class="text-muted">Remaining</dt>
      <dd>{{ remaining }}</dd>
    </dl>

    <template #footer>
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs text-muted">
          <div class="flex items-center gap-1.5">
            <UIcon class="size-3.5 shrink-0" name="i-lucide-package" />
            <span>{{ spoolCount }} {{ spoolCount === 1 ? 'spool' : 'spools' }}</span>
          </div>
          <span class="font-medium tabular-nums">{{ remainingWeightG }} / {{ totalWeightG }} g</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="h-1.5 flex-1 rounded-full bg-elevated overflow-hidden">
            <div
                :style="{
                  width: totalWeightG > 0 ? `${Math.round((remainingWeightG / totalWeightG) * 100)}%` : '0%',
                  backgroundColor: colorHex,
                }"
                class="h-full rounded-full transition-all"
            />
          </div>
          <span :style="{ color: colorHex }" class="text-xs font-semibold tabular-nums shrink-0">
            {{ Math.round((remainingWeightG / totalWeightG) * 100) }}%
          </span>
        </div>
      </div>
    </template>
  </UCard>
</template>
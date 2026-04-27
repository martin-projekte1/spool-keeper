<script lang="ts" setup>
defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'scanned': [value: string]
}>()

function onDetect(codes: { rawValue: string }[]) {
  const first = codes[0]?.rawValue
  if (!first) return
  emit('scanned', first)
  emit('update:modelValue', false)
}

function onError(err: unknown) {
  console.error('QR scanner error:', err)
}
</script>

<template>
  <UModal :open="modelValue" title="Scan QR Code" @update:open="emit('update:modelValue', $event)">
    <template #body>
      <div class="overflow-hidden rounded-lg">
        <QrcodeStream @detect="onDetect" @error="onError">
          <template #fallback>
            <div class="flex flex-col items-center justify-center py-12 gap-3 text-muted">
              <UIcon class="size-10" name="i-lucide-camera-off" />
              <p class="text-sm">Camera not available</p>
            </div>
          </template>
        </QrcodeStream>
      </div>
      <p class="text-xs text-muted text-center mt-3">
        Point at a QR code.
      </p>
    </template>
  </UModal>
</template>

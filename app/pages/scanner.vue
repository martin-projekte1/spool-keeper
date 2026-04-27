<script lang="ts" setup>
</script>
<template>
  <UContainer class="py-8 max-w-xl space-y-6">
    <UPageHeader
        description="Scan a spool's QR code to open its detail view.."
        title="QR Scanner"
    />

    <UCard>
      <!-- Camera viewfinder placeholder -->
      <div class="flex items-center justify-center rounded-lg bg-muted aspect-square text-muted">
        <div class="text-center space-y-2">
          <UIcon class="size-16 mx-auto" name="i-lucide-scan-qr-code"/>
          <p class="text-sm">Camera preview</p>
        </div>
      </div>

      <template #footer>
        <UButton block icon="i-lucide-camera">Snap Photo &amp; Analyze</UButton>
      </template>
    </UCard>

  </UContainer>
</template>

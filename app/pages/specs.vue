<script lang="ts" setup>
const tabs = [
  { label: 'Manufacturers', slot: 'manufacturers' },
  { label: 'Materials', slot: 'materials' },
  { label: 'Features', slot: 'features' },
  { label: 'Colors', slot: 'colors' },
]
</script>

<template>
  <UContainer class="py-8 max-w-3xl space-y-6">
    <UPageHeader title="Specs" description="Manage lookup data used across your filament catalog." />

    <UTabs :items="tabs" color="neutral" variant="link">

      <template #content="{ item }">
        <div v-if="item.slot === 'manufacturers'">
          <NameLookupManager resource="manufacturers" input-placeholder="New manufacturer name…" />
        </div>
        <div v-else-if="item.slot === 'materials'">
          <NameLookupManager resource="materials" input-placeholder="New material name…" />
        </div>
        <div v-else-if="item.slot === 'features'">
          <NameLookupManager resource="features" input-placeholder="New feature name…" />
        </div>
        <div v-else-if="item.slot === 'colors'">
          <ColorLookupManager />
        </div>
      </template>

    </UTabs>
  </UContainer>
</template>

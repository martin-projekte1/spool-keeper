<script lang="ts" setup>
import type { FilamentRecord } from '~/types/filament'

const { data: filamentsRaw } = await useFetch<FilamentRecord[]>('/api/filaments')

interface FilamentRow {
  id: number
  name: string
  material: string
  color: string
  colorHex: string
  manufacturer: string
  printTemp: string
  diameter: string
}

const filaments = computed<FilamentRow[]>(() =>
  (filamentsRaw.value ?? []).map(f => ({
    id: f.id,
    name: f.name,
    material: f.material?.name ?? '—',
    color: f.color?.name ?? '—',
    colorHex: f.color?.hex ?? '#888888',
    manufacturer: f.manufacturer?.name ?? '—',
    printTemp: `${f.printTempMin ?? '?'}–${f.printTempMax ?? '?'}°C`,
    diameter: `${f.diameter ?? 1.75} mm`,
  }))
)

const selected = ref<Set<number>>(new Set())

function toggleAll() {
  if (selected.value.size === filaments.value.length) {
    selected.value = new Set()
  } else {
    selected.value = new Set(filaments.value.map(f => f.id))
  }
}

const selectedFilaments = computed(() =>
  filaments.value.filter(f => selected.value.has(f.id))
)

function triggerPrint() {
  window.print()
}
</script>

<template>
  <UContainer class="py-8 max-w-3xl space-y-6">
    <UPageHeader
        description="Select filaments and print QR labels as a sheet."
        title="Print QR Labels"
    />

    <!-- Screen-only controls -->
    <UCard class="print:hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold leading-6">Select Filaments</h3>
          <div class="flex gap-2 items-center">
            <span class="text-sm text-muted">{{ selected.size }} selected</span>
            <UButton color="neutral" size="xs" variant="outline" @click="toggleAll">
              {{ selected.size === filaments.length ? 'Deselect all' : 'Select all' }}
            </UButton>
          </div>
        </div>
      </template>

      <div v-if="!filaments.length" class="text-center py-6 text-muted">
        No filaments found.
      </div>

      <div v-else class="divide-y divide-default">
        <label
            v-for="f in filaments"
            :key="f.id"
            class="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-elevated/50 px-2 rounded"
        >
          <input
              :checked="selected.has(f.id)"
              class="rounded shrink-0"
              type="checkbox"
              @change="selected.has(f.id) ? selected.delete(f.id) : selected.add(f.id)"
          />
          <span
              :style="{ background: f.colorHex }"
              class="size-3.5 rounded-full shrink-0 border border-default"
          />
          <span class="flex-1 min-w-0 block">
            <span class="block text-sm font-medium leading-tight truncate">{{ f.name }}
              <span class="text-muted font-normal"> · {{ f.manufacturer }}</span>
            </span>
            <span class="block text-xs text-muted leading-tight">{{ f.material }} · {{ f.color }}</span>
          </span>
        </label>
      </div>

      <template #footer>
        <UButton
            :disabled="selected.size === 0"
            block
            icon="i-lucide-printer"
            @click="triggerPrint"
        >
          Print {{ selected.size > 0 ? `${selected.size} label${selected.size > 1 ? 's' : ''}` : '' }}
        </UButton>
      </template>
    </UCard>

  </UContainer>

  <!-- Print-only label sheet — teleported to body to escape app layout for clean print -->
  <Teleport to="body">
    <div class="print-sheet">
      <div class="label-grid">
        <div
            v-for="f in selectedFilaments"
            :key="f.id"
            class="label-card"
        >
          <Qrcode :value="String(f.id)" black-color="#000000" class="qr" white-color="#ffffff" />
          <div class="label-info">
            <p class="label-name">{{ f.name }}</p>
            <p class="label-meta label-muted">{{ f.manufacturer }}</p>
            <p class="label-meta">{{ f.material }}</p>
            <p class="label-color">
              <span class="label-dot" :style="{ background: f.colorHex }" />
              {{ f.color }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
/* Hide the teleported print sheet on screen */
.print-sheet { display: none; }

@media print {
  @page { margin: 8mm; }

  html, body {
    color-scheme: light !important;
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Hide the entire app, show only the teleported print sheet */
  body > #__nuxt,
  body > #teleports,
  body > nav,
  body > header { display: none !important; }

  .print-sheet {
    display: block !important;
    color: black;
    background: white;
  }

  .label-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4mm;
    align-content: start;
  }

  .label-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 3mm;
    border: 0.5pt solid #ccc;
    border-radius: 3mm;
    padding: 4mm;
    page-break-inside: avoid;
  }

  .qr {
    width: 28mm !important;
    height: 28mm !important;
    flex-shrink: 0;
  }

  .qr svg { width: 100%; height: 100%; }

  .label-info {
    text-align: left;
    flex: 1;
    min-width: 0;
  }

  .label-name {
    font-size: 8pt;
    font-weight: 600;
    margin: 0;
    color: black;
  }

  .label-meta {
    font-size: 6pt;
    color: #555;
    margin: 0;
  }

  .label-color {
    font-size: 6pt;
    margin: 0.5mm 0 0;
    display: flex;
    align-items: center;
    gap: 1mm;
    color: #555;
  }

  .label-dot {
    display: inline-block;
    width: 2mm;
    height: 2mm;
    border-radius: 50%;
    border: 0.3pt solid #aaa;
    flex-shrink: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>

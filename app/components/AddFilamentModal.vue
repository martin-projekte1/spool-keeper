<script lang="ts" setup>
defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'created': []
}>()

const { data: manufacturers } = await useFetch('/api/manufacturers')
const { data: materialsData } = await useFetch('/api/materials')
const { data: colorsData } = await useFetch('/api/colors')
const { data: featuresData } = await useFetch('/api/features')

const state = reactive({
  name: '',
  materialId: undefined as number | undefined,
  manufacturerId: undefined as number | undefined,
  colorId: undefined as number | undefined,
  diameter: 1.75,
  printTempMin: 190,
  printTempMax: 220,
  featureIds: [] as number[],
  initialWeightG: 1000,
  status: 'sealed',
})

const loading = ref(false)
const ean = ref('')
const scannerOpen = ref(false)

const selectedColorHex = computed(() => {
  if (!state.colorId || !colorsData.value) return null
  return colorsData.value.find(c => c.id === state.colorId)?.hex ?? null
})

function reset() {
  Object.assign(state, {
    name: '', materialId: undefined, manufacturerId: undefined,
    colorId: undefined, diameter: 1.75,
    printTempMin: 190, printTempMax: 220,
    featureIds: [], initialWeightG: 1000, status: 'sealed',
  })
  ean.value = ''
}

async function saveFilament() {
  loading.value = true
  try {
    await $fetch('/api/filaments', {
      method: 'POST',
      body: { ...state, ean: ean.value || null },
    })
    reset()
    emit('created')
    emit('update:modelValue', false)
  } catch (err) {
    console.error('Failed to save filament:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal :open="modelValue" title="Add Filament" @update:open="emit('update:modelValue', $event)">
    <template #body>
      <form class="space-y-4" @submit.prevent="saveFilament">

        <UFormField label="EAN">
          <div class="flex gap-2">
            <UInput v-model="ean" class="flex-1" placeholder="Scan or type EAN / QR…" />
            <UButton icon="i-lucide-scan-barcode" variant="outline" @click="scannerOpen = true">Scan</UButton>
          </div>
        </UFormField>

        <QrScannerModal v-model="scannerOpen" @scanned="ean = $event" />

        <div class="grid grid-cols-2 gap-4">
          <UFormField class="col-span-2" label="Filament Name">
            <UInput v-model="state.name" class="w-full" placeholder="e.g. Rapid PLA+, ecoPLA…" required />
          </UFormField>

          <UFormField label="Material">
            <USelect
                v-model="state.materialId"
                :items="materialsData?.map(m => ({ label: m.name, value: m.id })) ?? []"
                class="w-full"
                placeholder="Select…"
            />
          </UFormField>

          <UFormField label="Manufacturer">
            <USelect
                v-model="state.manufacturerId"
                :items="manufacturers?.map(m => ({ label: m.name, value: m.id })) || []"
                class="w-full"
                placeholder="Select..."
            />
          </UFormField>
        </div>

        <UFormField label="Color">
          <div class="flex gap-2 items-center">
            <USelect
                v-model="state.colorId"
                :items="colorsData?.map(c => ({ label: c.name, value: c.id })) ?? []"
                class="flex-1"
                placeholder="Select color…"
            />
            <span
                v-if="selectedColorHex"
                :style="{ background: selectedColorHex }"
                class="size-9 rounded border border-default shrink-0"
            />
          </div>
        </UFormField>

        <UFormField label="Features">
          <div class="flex flex-wrap gap-3">
            <label
                v-for="feat in featuresData"
                :key="feat.id"
                class="flex items-center gap-1.5 text-sm cursor-pointer select-none"
            >
              <input v-model="state.featureIds" :value="feat.id" class="rounded" type="checkbox" />
              {{ feat.name }}
            </label>
          </div>
        </UFormField>

        <div class="grid grid-cols-3 gap-4 border-t border-default pt-4">
          <UFormField label="Diameter">
            <USelect
                v-model="state.diameter"
                :items="[{ label: '1.75 mm', value: 1.75 }, { label: '2.85 mm', value: 2.85 }]"
                class="w-full"
            />
          </UFormField>
          <UFormField label="Min Temp (°C)">
            <UInput v-model="state.printTempMin" max="350" min="150" required type="number" />
          </UFormField>
          <UFormField label="Max Temp (°C)">
            <UInput v-model="state.printTempMax" max="350" min="150" required type="number" />
          </UFormField>
        </div>

        <div class="grid grid-cols-2 gap-4 border-t border-default pt-4">
          <UFormField label="Initial Weight (g)">
            <UInput v-model="state.initialWeightG" min="100" required step="100" type="number" />
          </UFormField>
          <UFormField label="Spool Status">
            <USelect
                v-model="state.status"
                :items="[
                { label: 'Sealed', value: 'sealed' },
                { label: 'Open', value: 'open' },
                { label: 'Active', value: 'active' },
              ]"
                class="w-full"
            />
          </UFormField>
        </div>

        <UButton :loading="loading" block icon="i-lucide-save" type="submit">
          Save Filament & Spool
        </UButton>
      </form>
    </template>
  </UModal>
</template>

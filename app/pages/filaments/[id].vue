<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'

const route = useRoute()
const toast = useToast()

interface Spool {
  id: number
  status: 'sealed' | 'open' | 'active'
  remainingWeightG: number
  initialWeightG: number
  purchasedAt: string | null
}

interface EditableSpool {
  id: number | null
  status: 'sealed' | 'open' | 'active'
  remainingWeightG: number
  initialWeightG: number
  purchasedAt: string
}

interface FilamentDetail {
  id: number
  name: string
  material: { id: number; name: string } | null
  color: { id: number; name: string; hex: string } | null
  diameter: number | null
  ean: string | null
  manufacturerId: number | null
  features: { id: number; name: string }[]
  imageUrl: string | null
  printTempMin: number
  printTempMax: number
  spools: Spool[]
}

const { data: filament, pending, error, refresh } = await useFetch<FilamentDetail>(`/api/filaments/${route.params.id}`)
const { data: manufacturers } = await useFetch('/api/manufacturers')
const { data: materialsData } = await useFetch('/api/materials')
const { data: colorsData } = await useFetch('/api/colors')
const { data: featuresData } = await useFetch('/api/features')

const saving = ref(false)
const savingSpools = ref(false)
const scannerOpen = ref(false)
const spoolsEditing = ref(false)

const statusOptions = [
  { label: 'Sealed', value: 'sealed' as const },
  { label: 'Open', value: 'open' as const },
  { label: 'Active', value: 'active' as const },
]

const formState = reactive({
  name: '',
  materialId: undefined as number | undefined,
  manufacturerId: undefined as number | undefined,
  colorId: undefined as number | undefined,
  diameter: 1.75,
  printTempMin: 190,
  printTempMax: 220,
  featureIds: [] as number[],
  imageUrl: null as string | null,
  ean: '',
})

const editableSpools = ref<EditableSpool[]>([])

const selectedColorHex = computed(() => {
  if (!formState.colorId || !colorsData.value) return '#888888'
  return colorsData.value.find(c => c.id === formState.colorId)?.hex ?? '#888888'
})

watch(filament, (val) => {
  if (!val) return
  formState.name = val.name ?? ''
  formState.materialId = val.material?.id ?? undefined
  formState.manufacturerId = val.manufacturerId ?? undefined
  formState.colorId = val.color?.id ?? undefined
  formState.diameter = val.diameter ?? 1.75
  formState.printTempMin = val.printTempMin ?? 190
  formState.printTempMax = val.printTempMax ?? 220
  formState.featureIds = val.features?.map(f => f.id) ?? []
  formState.imageUrl = val.imageUrl ?? null
  formState.ean = val.ean ?? ''
  editableSpools.value = (val.spools ?? []).map(s => ({
    id: s.id,
    status: s.status,
    remainingWeightG: s.remainingWeightG,
    initialWeightG: s.initialWeightG,
    purchasedAt: s.purchasedAt ?? '',
  }))
}, { immediate: true })

async function updateFilament() {
  if (!filament.value) return
  saving.value = true
  try {
    const updated = await $fetch<FilamentDetail>(`/api/filaments/${route.params.id}`, {
      method: 'PUT',
      body: { ...formState },
    })
    filament.value = {
      ...filament.value,
      ...updated,
      features: (featuresData.value ?? []).filter(f => formState.featureIds.includes(f.id)),
      spools: filament.value.spools,
      manufacturer: filament.value.manufacturer,
      material: filament.value.material,
      color: filament.value.color,
    }
    toast.add({ title: 'Filament updated', icon: 'i-lucide-check-circle', color: 'success' })
  } catch (err) {
    console.error(err)
    toast.add({ title: 'Error updating filament', color: 'error' })
  } finally {
    saving.value = false
  }
}

const uploading = ref(false)
async function uploadImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const form = new FormData()
    form.append('image', file)
    const result = await $fetch<{ imageUrl: string }>(`/api/filaments/${route.params.id}/image`, {
      method: 'POST',
      body: form,
    })
    formState.imageUrl = result.imageUrl
    if (filament.value) filament.value.imageUrl = result.imageUrl
    toast.add({ title: 'Image updated', icon: 'i-lucide-check-circle', color: 'success' })
  } catch (err) {
    console.error(err)
    toast.add({ title: 'Image upload failed', color: 'error' })
  } finally {
    uploading.value = false
  }
}

function addSpool() {
  editableSpools.value.push({
    id: null,
    status: 'sealed',
    remainingWeightG: 1000,
    initialWeightG: 1000,
    purchasedAt: new Date().toISOString().slice(0, 10),
  })
}

async function saveSpools() {
  if (!filament.value) return
  savingSpools.value = true
  try {
    await Promise.all(editableSpools.value.map(spool => {
      if (spool.id === null) {
        return $fetch('/api/spools', {
          method: 'POST',
          body: {
            filamentId: filament.value!.id,
            status: spool.status,
            initialWeightG: spool.initialWeightG,
            remainingWeightG: spool.remainingWeightG,
            purchasedAt: spool.purchasedAt || null,
          },
        })
      } else {
        return $fetch(`/api/spools/${spool.id}`, {
          method: 'PUT',
          body: {
            status: spool.status,
            remainingWeightG: spool.remainingWeightG,
            purchasedAt: spool.purchasedAt || null,
          },
        })
      }
    }))
    await refresh()
    toast.add({ title: 'Spools saved', icon: 'i-lucide-check-circle', color: 'success' })
  } catch (err) {
    console.error(err)
    toast.add({ title: 'Error saving spools', color: 'error' })
  } finally {
    savingSpools.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 space-y-6">

    <div>
      <UButton color="neutral" icon="i-lucide-arrow-left" to="/" variant="ghost">Back to Dashboard</UButton>
    </div>

    <UPageHeader
        :description="filament ? `${filament.material?.name ?? '—'} • ${filament.color?.name ?? '—'}` : ''"
        :title="filament?.name || 'Loading...'"
    />

    <div v-if="pending" class="text-neutral-500">Loading filament data...</div>
    <div v-else-if="error" class="text-error-500">Error loading filament: {{ error.message }}</div>

    <div v-else-if="filament" class="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6 items-start">

      <!-- Left: Filament Details -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold leading-6">Filament Details</h3>
        </template>

        <form class="space-y-4" @submit.prevent="updateFilament">
          <UFormField label="EAN">
            <div class="flex gap-2">
              <UInput v-model="formState.ean" class="flex-1" placeholder="Scan or type EAN…" />
              <UButton icon="i-lucide-scan-barcode" variant="outline" @click="scannerOpen = true" />
            </div>
          </UFormField>

          <UFormField label="Name">
            <UInput v-model="formState.name" class="w-full" required />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Material">
              <USelect
                  v-model="formState.materialId"
                  :items="materialsData?.map(m => ({ label: m.name, value: m.id })) ?? []"
                  class="w-full"
                  placeholder="Select…"
              />
            </UFormField>

            <UFormField label="Manufacturer">
              <USelect
                  v-model="formState.manufacturerId"
                  :items="manufacturers?.map(m => ({ label: m.name, value: m.id })) ?? []"
                  class="w-full"
                  placeholder="Select…"
              />
            </UFormField>
          </div>

          <UFormField label="Color">
            <div class="flex gap-2 items-center">
              <USelect
                  v-model="formState.colorId"
                  :items="colorsData?.map(c => ({ label: c.name, value: c.id })) ?? []"
                  class="flex-1"
                  placeholder="Select color…"
              />
              <span
                  :style="{ background: selectedColorHex }"
                  class="size-9 rounded border border-default shrink-0"
              />
            </div>
          </UFormField>

          <div class="grid grid-cols-3 gap-4">
            <UFormField label="Diameter">
              <USelect
                  v-model="formState.diameter"
                  :items="[{ label: '1.75 mm', value: 1.75 }, { label: '2.85 mm', value: 2.85 }]"
                  class="w-full"
              />
            </UFormField>
            <UFormField label="Min °C">
              <UInput v-model="formState.printTempMin" class="w-full" placeholder="Min" type="number" />
            </UFormField>
            <UFormField label="Max °C">
              <UInput v-model="formState.printTempMax" class="w-full" placeholder="Max" type="number" />
            </UFormField>
          </div>

          <UFormField label="Features">
            <div class="flex flex-wrap gap-3">
              <label
                  v-for="feat in featuresData"
                  :key="feat.id"
                  class="flex items-center gap-1.5 text-sm cursor-pointer select-none"
              >
                <input v-model="formState.featureIds" :value="feat.id" class="rounded" type="checkbox" />
                {{ feat.name }}
              </label>
            </div>
          </UFormField>

          <UFormField label="Image">
            <div class="space-y-2">
              <NuxtImg
                  v-if="formState.imageUrl"
                  :src="formState.imageUrl"
                  class="size-20 rounded object-cover border border-default"
                  format="webp"
                  height="80"
                  width="80"
              />
              <label class="block">
                <UButton
                    :loading="uploading"
                    as="span"
                    color="neutral"
                    icon="i-lucide-upload"
                    size="xs"
                    variant="outline"
                >Upload Image</UButton>
                <input accept="image/*" class="hidden" type="file" @change="uploadImage" />
              </label>
            </div>
          </UFormField>

          <UButton :loading="saving" block icon="i-lucide-save" type="submit">
            Save Changes
          </UButton>
        </form>
      </UCard>

      <!-- Right: Spools -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold leading-6">Inventory (Physical Spools)</h3>
            <div class="flex gap-2">
              <UButton
                  v-if="spoolsEditing"
                  color="primary"
                  icon="i-lucide-plus"
                  size="sm"
                  @click="addSpool"
              >Add Spool</UButton>
              <UButton
                  :icon="spoolsEditing ? 'i-lucide-eye' : 'i-lucide-pencil'"
                  :variant="spoolsEditing ? 'outline' : 'ghost'"
                  color="neutral"
                  size="sm"
                  @click="spoolsEditing = !spoolsEditing"
              >{{ spoolsEditing ? 'Read only' : 'Edit' }}</UButton>
            </div>
          </div>
        </template>

        <div v-if="!editableSpools.length" class="text-center py-6 text-neutral-500">
          No spools registered for this filament yet.
          <UButton class="mt-3" color="primary" icon="i-lucide-plus" size="sm" @click="spoolsEditing = true; addSpool()">Add first spool</UButton>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-default">
                <th class="text-left py-2 pr-4 font-medium text-muted">Status</th>
                <th class="text-left py-2 pr-4 font-medium text-muted">Remaining (g)</th>
                <th class="text-left py-2 pr-4 font-medium text-muted">Initial (g)</th>
                <th class="text-left py-2 font-medium text-muted">Purchased</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(spool, i) in editableSpools" :key="spool.id ?? `new-${i}`" class="border-b border-default last:border-0">
                <td class="py-2 pr-4">
                  <USelect v-if="spoolsEditing" v-model="spool.status" :items="statusOptions" class="w-32" size="sm" />
                  <UBadge v-else :color="spool.status === 'sealed' ? 'success' : spool.status === 'open' ? 'primary' : 'secondary'" variant="subtle">
                    {{ spool.status }}
                  </UBadge>
                </td>
                <td class="py-2 pr-4">
                  <UInput v-if="spoolsEditing" v-model.number="spool.remainingWeightG" class="w-28" min="0" size="sm" step="1" type="number" />
                  <span v-else>{{ spool.remainingWeightG }} g</span>
                </td>
                <td class="py-2 pr-4">
                  <UInput v-if="spoolsEditing" v-model.number="spool.initialWeightG" class="w-28" min="0" size="sm" step="1" type="number" />
                  <span v-else>{{ spool.initialWeightG }} g</span>
                </td>
                <td class="py-2">
                  <UInput v-if="spoolsEditing" v-model="spool.purchasedAt" class="w-40" size="sm" type="date" />
                  <span v-else>{{ spool.purchasedAt || '—' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <template v-if="spoolsEditing" #footer>
          <UButton :loading="savingSpools" block icon="i-lucide-save" @click="saveSpools">
            Save Spools
          </UButton>
        </template>
      </UCard>

    </div>

    <QrScannerModal v-model="scannerOpen" @scanned="formState.ean = $event" />
  </UContainer>
</template>

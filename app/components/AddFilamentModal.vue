<script lang="ts" setup>
import type { SpoolStatus } from '~/types/filament'
import { SPOOL_STATUS_OPTIONS } from '~/types/filament'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'created': []
}>()

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
  status: 'sealed' as SpoolStatus,
  ean: '',
})

const loading = ref(false)
const imageFile = ref<File | null>(null)
const imagePreviewUrl = computed(() =>
  imageFile.value ? URL.createObjectURL(imageFile.value) : null
)
const scannerOpen = ref(false)

function onImageChange(event: Event) {
  imageFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
}

function reset() {
  Object.assign(state, {
    name: '', materialId: undefined, manufacturerId: undefined,
    colorId: undefined, diameter: 1.75,
    printTempMin: 190, printTempMax: 220,
    featureIds: [], initialWeightG: 1000, status: 'sealed' as SpoolStatus,
    ean: '',
  })
  imageFile.value = null
}

async function saveFilament() {
  loading.value = true
  try {
    const newFilament = await $fetch<{ id: number }>('/api/filaments', {
      method: 'POST',
      body: { ...state, ean: state.ean || null },
    })

    if (imageFile.value && newFilament?.id) {
      const form = new FormData()
      form.append('image', imageFile.value)
      await $fetch(`/api/filaments/${newFilament.id}/image`, { method: 'POST', body: form })
    }

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
      <form @submit.prevent="saveFilament">
        <FilamentForm
            v-model="state"
            :image-file-name="imageFile?.name"
            :image-preview-url="imagePreviewUrl"
            @image-change="onImageChange"
            @open-scanner="scannerOpen = true"
        >
          <template #scan-button-label>Scan</template>
          <template #footer>
            <div class="grid grid-cols-2 gap-4 border-t border-default pt-4">
              <UFormField label="Initial Weight (g)">
                <UInput v-model="state.initialWeightG" min="100" required step="100" type="number" />
              </UFormField>
              <UFormField label="Spool Status">
                <USelect
                    v-model="state.status"
                    :items="SPOOL_STATUS_OPTIONS"
                    class="w-full"
                />
              </UFormField>
            </div>

            <UButton :loading="loading" block class="mt-4" icon="i-lucide-save" type="submit">
              Save Filament & Spool
            </UButton>
          </template>
        </FilamentForm>

        <QrScannerModal v-model="scannerOpen" @scanned="state.ean = $event" />
      </form>
    </template>
  </UModal>
</template>


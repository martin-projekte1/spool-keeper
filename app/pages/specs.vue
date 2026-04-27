<script lang="ts" setup>
const toast = useToast()

// --- Manufacturers ---
const { data: mfrs, refresh: refreshMfrs } = await useFetch('/api/manufacturers')
const newMfrName = ref('')
const editingMfr = ref<{ id: number; name: string } | null>(null)

async function addMfr() {
  if (!newMfrName.value.trim()) return
  await $fetch('/api/manufacturers', { method: 'POST', body: { name: newMfrName.value } })
  newMfrName.value = ''
  await refreshMfrs()
}
async function saveMfr() {
  if (!editingMfr.value) return
  await $fetch(`/api/manufacturers/${editingMfr.value.id}`, { method: 'PUT', body: { name: editingMfr.value.name } })
  editingMfr.value = null
  await refreshMfrs()
}
async function deleteMfr(id: number) {
  await $fetch(`/api/manufacturers/${id}`, { method: 'DELETE' })
  await refreshMfrs()
}

// --- Materials ---
const { data: mats, refresh: refreshMats } = await useFetch('/api/materials')
const newMatName = ref('')
const editingMat = ref<{ id: number; name: string } | null>(null)

async function addMat() {
  if (!newMatName.value.trim()) return
  await $fetch('/api/materials', { method: 'POST', body: { name: newMatName.value } })
  newMatName.value = ''
  await refreshMats()
}
async function saveMat() {
  if (!editingMat.value) return
  await $fetch(`/api/materials/${editingMat.value.id}`, { method: 'PUT', body: { name: editingMat.value.name } })
  editingMat.value = null
  await refreshMats()
}
async function deleteMat(id: number) {
  await $fetch(`/api/materials/${id}`, { method: 'DELETE' })
  await refreshMats()
}

// --- Features ---
const { data: feats, refresh: refreshFeats } = await useFetch('/api/features')
const newFeatName = ref('')
const editingFeat = ref<{ id: number; name: string } | null>(null)

async function addFeat() {
  if (!newFeatName.value.trim()) return
  await $fetch('/api/features', { method: 'POST', body: { name: newFeatName.value } })
  newFeatName.value = ''
  await refreshFeats()
}
async function saveFeat() {
  if (!editingFeat.value) return
  await $fetch(`/api/features/${editingFeat.value.id}`, { method: 'PUT', body: { name: editingFeat.value.name } })
  editingFeat.value = null
  await refreshFeats()
}
async function deleteFeat(id: number) {
  await $fetch(`/api/features/${id}`, { method: 'DELETE' })
  await refreshFeats()
}

// --- Colors ---
const { data: cols, refresh: refreshCols } = await useFetch('/api/colors')
const newColor = reactive({ name: '', hex: '#111111' })
const editingCol = ref<{ id: number; name: string; hex: string } | null>(null)

async function addCol() {
  if (!newColor.name.trim()) return
  await $fetch('/api/colors', { method: 'POST', body: { name: newColor.name, hex: newColor.hex } })
  newColor.name = ''
  newColor.hex = '#111111'
  await refreshCols()
}
async function saveCol() {
  if (!editingCol.value) return
  await $fetch(`/api/colors/${editingCol.value.id}`, { method: 'PUT', body: { name: editingCol.value.name, hex: editingCol.value.hex } })
  editingCol.value = null
  await refreshCols()
}
async function deleteCol(id: number) {
  await $fetch(`/api/colors/${id}`, { method: 'DELETE' })
  await refreshCols()
}

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

      <!-- Manufacturers -->
      <template #manufacturers>
        <UCard class="mt-4">
          <div class="space-y-3">
            <div class="flex gap-2">
              <UInput v-model="newMfrName" class="flex-1" placeholder="New manufacturer name…" @keydown.enter.prevent="addMfr" />
              <UButton icon="i-lucide-plus" @click="addMfr">Add</UButton>
            </div>
            <UTable
              :columns="[{ accessorKey: 'name', header: 'Name' }, { id: 'actions' }]"
              :data="mfrs ?? []"
            >
              <template #name-cell="{ row }">
                <UInput
                  v-if="editingMfr?.id === row.original.id"
                  v-model="editingMfr.name"
                  class="w-full"
                  @keydown.enter.prevent="saveMfr"
                  @keydown.escape="editingMfr = null"
                />
                <span v-else>{{ row.original.name }}</span>
              </template>
              <template #actions-cell="{ row }">
                <div class="flex gap-1 justify-end">
                  <template v-if="editingMfr?.id === row.original.id">
                    <UButton color="primary" icon="i-lucide-check" size="xs" variant="ghost" @click="saveMfr" />
                    <UButton color="neutral" icon="i-lucide-x" size="xs" variant="ghost" @click="editingMfr = null" />
                  </template>
                  <template v-else>
                    <UButton color="neutral" icon="i-lucide-pencil" size="xs" variant="ghost" @click="editingMfr = { id: row.original.id, name: row.original.name }" />
                    <UButton color="error" icon="i-lucide-trash-2" size="xs" variant="ghost" @click="deleteMfr(row.original.id)" />
                  </template>
                </div>
              </template>
            </UTable>
          </div>
        </UCard>
      </template>

      <!-- Materials -->
      <template #materials>
        <UCard class="mt-4">
          <div class="space-y-3">
            <div class="flex gap-2">
              <UInput v-model="newMatName" class="flex-1" placeholder="New material name…" @keydown.enter.prevent="addMat" />
              <UButton icon="i-lucide-plus" @click="addMat">Add</UButton>
            </div>
            <UTable
              :columns="[{ accessorKey: 'name', header: 'Name' }, { id: 'actions' }]"
              :data="mats ?? []"
            >
              <template #name-cell="{ row }">
                <UInput
                  v-if="editingMat?.id === row.original.id"
                  v-model="editingMat.name"
                  class="w-full"
                  @keydown.enter.prevent="saveMat"
                  @keydown.escape="editingMat = null"
                />
                <span v-else>{{ row.original.name }}</span>
              </template>
              <template #actions-cell="{ row }">
                <div class="flex gap-1 justify-end">
                  <template v-if="editingMat?.id === row.original.id">
                    <UButton color="primary" icon="i-lucide-check" size="xs" variant="ghost" @click="saveMat" />
                    <UButton color="neutral" icon="i-lucide-x" size="xs" variant="ghost" @click="editingMat = null" />
                  </template>
                  <template v-else>
                    <UButton color="neutral" icon="i-lucide-pencil" size="xs" variant="ghost" @click="editingMat = { id: row.original.id, name: row.original.name }" />
                    <UButton color="error" icon="i-lucide-trash-2" size="xs" variant="ghost" @click="deleteMat(row.original.id)" />
                  </template>
                </div>
              </template>
            </UTable>
          </div>
        </UCard>
      </template>

      <!-- Features -->
      <template #features>
        <UCard class="mt-4">
          <div class="space-y-3">
            <div class="flex gap-2">
              <UInput v-model="newFeatName" class="flex-1" placeholder="New feature name…" @keydown.enter.prevent="addFeat" />
              <UButton icon="i-lucide-plus" @click="addFeat">Add</UButton>
            </div>
            <UTable
              :columns="[{ accessorKey: 'name', header: 'Name' }, { id: 'actions' }]"
              :data="feats ?? []"
            >
              <template #name-cell="{ row }">
                <UInput
                  v-if="editingFeat?.id === row.original.id"
                  v-model="editingFeat.name"
                  class="w-full"
                  @keydown.enter.prevent="saveFeat"
                  @keydown.escape="editingFeat = null"
                />
                <span v-else>{{ row.original.name }}</span>
              </template>
              <template #actions-cell="{ row }">
                <div class="flex gap-1 justify-end">
                  <template v-if="editingFeat?.id === row.original.id">
                    <UButton color="primary" icon="i-lucide-check" size="xs" variant="ghost" @click="saveFeat" />
                    <UButton color="neutral" icon="i-lucide-x" size="xs" variant="ghost" @click="editingFeat = null" />
                  </template>
                  <template v-else>
                    <UButton color="neutral" icon="i-lucide-pencil" size="xs" variant="ghost" @click="editingFeat = { id: row.original.id, name: row.original.name }" />
                    <UButton color="error" icon="i-lucide-trash-2" size="xs" variant="ghost" @click="deleteFeat(row.original.id)" />
                  </template>
                </div>
              </template>
            </UTable>
          </div>
        </UCard>
      </template>

      <!-- Colors -->
      <template #colors>
        <UCard class="mt-4">
          <div class="space-y-3">
            <div class="flex gap-2 items-center">
              <UInput v-model="newColor.name" class="flex-1" placeholder="Color name…" @keydown.enter.prevent="addCol" />
              <input v-model="newColor.hex" class="h-9 w-10 cursor-pointer border border-default rounded" title="Pick a color" type="color" />
              <UButton icon="i-lucide-plus" @click="addCol">Add</UButton>
            </div>
            <UTable
              :columns="[{ accessorKey: 'name', header: 'Name' }, { accessorKey: 'hex', header: 'Hex' }, { id: 'actions' }]"
              :data="cols ?? []"
            >
              <template #name-cell="{ row }">
                <UInput
                  v-if="editingCol?.id === row.original.id"
                  v-model="editingCol.name"
                  class="w-full"
                  @keydown.escape="editingCol = null"
                />
                <span v-else>{{ row.original.name }}</span>
              </template>
              <template #hex-cell="{ row }">
                <div v-if="editingCol?.id === row.original.id" class="flex items-center gap-2">
                  <input v-model="editingCol.hex" class="h-7 w-9 cursor-pointer border border-default rounded" type="color" />
                  <span class="text-xs text-muted">{{ editingCol.hex }}</span>
                </div>
                <div v-else class="flex items-center gap-2">
                  <span :style="{ backgroundColor: row.original.hex }" class="inline-block size-4 rounded-full border border-default shrink-0" />
                  <span class="text-xs text-muted">{{ row.original.hex }}</span>
                </div>
              </template>
              <template #actions-cell="{ row }">
                <div class="flex gap-1 justify-end">
                  <template v-if="editingCol?.id === row.original.id">
                    <UButton color="primary" icon="i-lucide-check" size="xs" variant="ghost" @click="saveCol" />
                    <UButton color="neutral" icon="i-lucide-x" size="xs" variant="ghost" @click="editingCol = null" />
                  </template>
                  <template v-else>
                    <UButton color="neutral" icon="i-lucide-pencil" size="xs" variant="ghost" @click="editingCol = { id: row.original.id, name: row.original.name, hex: row.original.hex }" />
                    <UButton color="error" icon="i-lucide-trash-2" size="xs" variant="ghost" @click="deleteCol(row.original.id)" />
                  </template>
                </div>
              </template>
            </UTable>
          </div>
        </UCard>
      </template>

    </UTabs>
  </UContainer>
</template>

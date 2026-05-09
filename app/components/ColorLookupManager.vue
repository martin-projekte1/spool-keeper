<script lang="ts" setup>
import type { ColorLookupItem } from '~/types/filament'

const { data: colors, refresh } = await useFetch<ColorLookupItem[]>('/api/colors')

const newColor = reactive({ name: '', hex: '#111111' })
const editing = ref<ColorLookupItem | null>(null)

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'hex', header: 'Hex' },
  { id: 'actions' },
]

async function addColor() {
  if (!newColor.name.trim()) return
  await $fetch('/api/colors', { method: 'POST', body: { name: newColor.name, hex: newColor.hex } })
  newColor.name = ''
  newColor.hex = '#111111'
  await refresh()
}

async function saveColor() {
  if (!editing.value) return
  await $fetch(`/api/colors/${editing.value.id}`, {
    method: 'PUT',
    body: { name: editing.value.name, hex: editing.value.hex },
  })
  editing.value = null
  await refresh()
}

async function deleteColor(id: number) {
  await $fetch(`/api/colors/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <UCard class="mt-4">
    <div class="space-y-3">
      <div class="flex gap-2 items-center">
        <UInput v-model="newColor.name" class="flex-1" placeholder="Color name…" @keydown.enter.prevent="addColor" />
        <input v-model="newColor.hex" class="h-9 w-10 cursor-pointer border border-default rounded" title="Pick a color" type="color" />
        <UButton icon="i-lucide-plus" @click="addColor">Add</UButton>
      </div>

      <UTable :columns="columns" :data="colors ?? []">
        <template #name-cell="{ row }">
          <UInput
            v-if="editing?.id === row.original.id"
            v-model="editing.name"
            class="w-full"
            @keydown.enter.prevent="saveColor"
            @keydown.escape="editing = null"
          />
          <span v-else>{{ row.original.name }}</span>
        </template>

        <template #hex-cell="{ row }">
          <div v-if="editing?.id === row.original.id" class="flex items-center gap-2">
            <input v-model="editing.hex" class="h-7 w-9 cursor-pointer border border-default rounded" type="color" />
            <span class="text-xs text-muted">{{ editing.hex }}</span>
          </div>
          <div v-else class="flex items-center gap-2">
            <span :style="{ backgroundColor: row.original.hex }" class="inline-block size-4 rounded-full border border-default shrink-0" />
            <span class="text-xs text-muted">{{ row.original.hex }}</span>
          </div>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-1 justify-end">
            <template v-if="editing?.id === row.original.id">
              <UButton color="primary" icon="i-lucide-check" size="xs" variant="ghost" @click="saveColor" />
              <UButton color="neutral" icon="i-lucide-x" size="xs" variant="ghost" @click="editing = null" />
            </template>
            <template v-else>
              <UButton
                color="neutral"
                icon="i-lucide-pencil"
                size="xs"
                variant="ghost"
                @click="editing = { id: row.original.id, name: row.original.name, hex: row.original.hex }"
              />
              <UButton color="error" icon="i-lucide-trash-2" size="xs" variant="ghost" @click="deleteColor(row.original.id)" />
            </template>
          </div>
        </template>
      </UTable>
    </div>
  </UCard>
</template>

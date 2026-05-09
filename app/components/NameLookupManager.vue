<script lang="ts" setup>
import type { LookupItem } from '~/types/filament'

type ResourceName = 'manufacturers' | 'materials' | 'features'

const props = defineProps<{
  resource: ResourceName
  inputPlaceholder: string
}>()

const { data: items, refresh } = await useFetch<LookupItem[]>(() => `/api/${props.resource}`)

const newName = ref('')
const editing = ref<LookupItem | null>(null)

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { id: 'actions' },
]

async function addItem() {
  if (!newName.value.trim()) return
  await $fetch(`/api/${props.resource}`, { method: 'POST', body: { name: newName.value } })
  newName.value = ''
  await refresh()
}

async function saveItem() {
  if (!editing.value) return
  await $fetch(`/api/${props.resource}/${editing.value.id}`, { method: 'PUT', body: { name: editing.value.name } })
  editing.value = null
  await refresh()
}

async function deleteItem(id: number) {
  await $fetch(`/api/${props.resource}/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <UCard class="mt-4">
    <div class="space-y-3">
      <div class="flex gap-2">
        <UInput v-model="newName" class="flex-1" :placeholder="inputPlaceholder" @keydown.enter.prevent="addItem" />
        <UButton icon="i-lucide-plus" @click="addItem">Add</UButton>
      </div>

      <UTable :columns="columns" :data="items ?? []">
        <template #name-cell="{ row }">
          <UInput
            v-if="editing?.id === row.original.id"
            v-model="editing.name"
            class="w-full"
            @keydown.enter.prevent="saveItem"
            @keydown.escape="editing = null"
          />
          <span v-else>{{ row.original.name }}</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-1 justify-end">
            <template v-if="editing?.id === row.original.id">
              <UButton color="primary" icon="i-lucide-check" size="xs" variant="ghost" @click="saveItem" />
              <UButton color="neutral" icon="i-lucide-x" size="xs" variant="ghost" @click="editing = null" />
            </template>
            <template v-else>
              <UButton
                color="neutral"
                icon="i-lucide-pencil"
                size="xs"
                variant="ghost"
                @click="editing = { id: row.original.id, name: row.original.name }"
              />
              <UButton color="error" icon="i-lucide-trash-2" size="xs" variant="ghost" @click="deleteItem(row.original.id)" />
            </template>
          </div>
        </template>
      </UTable>
    </div>
  </UCard>
</template>

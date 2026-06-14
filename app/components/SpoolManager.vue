<script lang="ts" setup>
import type { EditableSpool, Spool } from "~/types/filament";
import { SPOOL_STATUS_OPTIONS } from "~/types/filament";

const props = defineProps<{
  filamentId: number;
  spools: Spool[];
}>();

const emit = defineEmits<{
  saved: [];
}>();

const toast = useToast();
const savingSpools = ref(false);
const spoolsEditing = ref(false);
const editableSpools = ref<EditableSpool[]>([]);

watch(
  () => props.spools,
  (val) => {
    editableSpools.value = val.map((s) => ({
      id: s.id,
      status: s.status,
      remainingWeightG: s.remainingWeightG,
      initialWeightG: s.initialWeightG,
      purchasedAt: s.purchasedAt ?? "",
    }));
  },
  { immediate: true },
);

function addSpool() {
  editableSpools.value.push({
    id: null,
    status: "sealed",
    remainingWeightG: 1000,
    initialWeightG: 1000,
    purchasedAt: new Date().toISOString().slice(0, 10),
  });
}

async function deleteSpool(spool: EditableSpool, index: number) {
  if (spool.id === null) {
    editableSpools.value.splice(index, 1);
    return;
  }
  try {
    await $fetch(`/api/spools/${spool.id}`, { method: "DELETE" });
    emit("saved");
    toast.add({ title: "Spool deleted", icon: "i-lucide-trash-2" });
  } catch (err: any) {
    toast.add({
      title: err?.data?.statusMessage ?? "Error deleting spool",
      color: "error",
    });
  }
}

async function saveSpools() {
  savingSpools.value = true;
  try {
    await Promise.all(
      editableSpools.value.map((spool) => {
        if (spool.id === null) {
          return $fetch("/api/spools", {
            method: "POST",
            body: {
              filamentId: props.filamentId,
              status: spool.status,
              initialWeightG: spool.initialWeightG,
              remainingWeightG: spool.remainingWeightG,
              purchasedAt: spool.purchasedAt || null,
            },
          });
        } else {
          return $fetch(`/api/spools/${spool.id}`, {
            method: "PUT",
            body: {
              status: spool.status,
              remainingWeightG: spool.remainingWeightG,
              purchasedAt: spool.purchasedAt || null,
            },
          });
        }
      }),
    );
    emit("saved");
    spoolsEditing.value = false;
    toast.add({ title: "Spools saved", icon: "i-lucide-check-circle" });
  } catch (err) {
    console.error(err);
    toast.add({ title: "Error saving spools", color: "error" });
  } finally {
    savingSpools.value = false;
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold leading-6">
          Inventory (Physical Spools)
        </h3>
        <div class="flex gap-2">
          <UButton
            v-if="spoolsEditing"
            color="primary"
            icon="i-lucide-plus"
            size="sm"
            @click="addSpool"
            >Add Spool</UButton
          >
          <UButton
            :icon="spoolsEditing ? 'i-lucide-eye' : 'i-lucide-pencil'"
            :variant="spoolsEditing ? 'outline' : 'ghost'"
            color="neutral"
            size="sm"
            @click="spoolsEditing = !spoolsEditing"
            >{{ spoolsEditing ? "Read only" : "Edit" }}</UButton
          >
        </div>
      </div>
    </template>

    <div
      v-if="!editableSpools.length"
      class="text-center py-6 text-neutral-500"
    >
      No spools registered for this filament yet.
      <UButton
        class="mt-3"
        color="primary"
        icon="i-lucide-plus"
        size="sm"
        @click="
          spoolsEditing = true;
          addSpool();
        "
        >Add first spool</UButton
      >
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-default">
            <th class="text-left py-2 pr-4 font-medium text-muted">Status</th>
            <th class="text-left py-2 pr-4 font-medium text-muted">
              Remaining (g)
            </th>
            <th class="text-left py-2 pr-4 font-medium text-muted">
              Initial (g)
            </th>
            <th class="text-left py-2 font-medium text-muted">Purchased</th>
            <th v-if="spoolsEditing" class="py-2 w-8"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(spool, i) in editableSpools"
            :key="spool.id ?? `new-${i}`"
            class="border-b border-default last:border-0"
          >
            <td class="py-2 pr-4">
              <USelect
                v-if="spoolsEditing"
                v-model="spool.status"
                :items="SPOOL_STATUS_OPTIONS"
                class="w-32"
                size="sm"
              />
              <UBadge
                v-else
                :color="
                  spool.status === 'sealed'
                    ? 'success'
                    : spool.status === 'open'
                      ? 'primary'
                      : 'secondary'
                "
                variant="subtle"
              >
                {{ spool.status }}
              </UBadge>
            </td>
            <td class="py-2 pr-4">
              <UInput
                v-if="spoolsEditing"
                v-model.number="spool.remainingWeightG"
                class="w-28"
                min="0"
                size="sm"
                step="100"
                type="number"
              />
              <span v-else>{{ spool.remainingWeightG }} g</span>
            </td>
            <td class="py-2 pr-4">
              <UInput
                v-if="spoolsEditing"
                v-model.number="spool.initialWeightG"
                class="w-28"
                min="0"
                size="sm"
                step="100"
                type="number"
              />
              <span v-else>{{ spool.initialWeightG }} g</span>
            </td>
            <td class="py-2">
              <UInput
                v-if="spoolsEditing"
                v-model="spool.purchasedAt"
                class="w-40"
                size="sm"
                type="date"
              />
              <span v-else>{{ spool.purchasedAt || "—" }}</span>
            </td>
            <td v-if="spoolsEditing" class="py-2 pl-2">
              <UButton
                :disabled="editableSpools.length <= 1"
                color="error"
                icon="i-lucide-trash-2"
                size="xs"
                variant="ghost"
                @click="deleteSpool(spool, i)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <template v-if="spoolsEditing" #footer>
      <UButton
        :loading="savingSpools"
        block
        icon="i-lucide-save"
        @click="saveSpools"
      >
        Save Spools
      </UButton>
    </template>
  </UCard>
</template>

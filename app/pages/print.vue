<script lang="ts" setup>
import type { FilamentRecord } from "~/types/filament";

const { data: filamentsRaw } =
  await useFetch<FilamentRecord[]>("/api/filaments");

interface FilamentRow {
  id: number;
  name: string;
  material: string;
  color: string;
  colorHex: string;
  manufacturer: string;
  printTemp: string;
  diameter: string;
}

const filaments = computed<FilamentRow[]>(() =>
  (filamentsRaw.value ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    material: f.material?.name ?? "—",
    color: f.color?.name ?? "—",
    colorHex: f.color?.hex ?? "#888888",
    manufacturer: f.manufacturer?.name ?? "—",
    printTemp: `${f.printTempMin ?? "?"}–${f.printTempMax ?? "?"}°C`,
    diameter: `${f.diameter ?? 1.75} mm`,
  })),
);

const selected = ref<Set<number>>(new Set());

function toggleAll() {
  if (selected.value.size === filaments.value.length) {
    selected.value = new Set();
  } else {
    selected.value = new Set(filaments.value.map((f) => f.id));
  }
}

const selectedFilaments = computed(() =>
  filaments.value.filter((f) => selected.value.has(f.id)),
);

function triggerPrint() {
  window.print();
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
            <UButton
              color="neutral"
              size="xs"
              variant="outline"
              @click="toggleAll"
            >
              {{
                selected.size === filaments.length
                  ? "Deselect all"
                  : "Select all"
              }}
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
            @change="
              selected.has(f.id) ? selected.delete(f.id) : selected.add(f.id)
            "
          />
          <span
            :style="{ background: f.colorHex }"
            class="size-3.5 rounded-full shrink-0 border border-default"
          />
          <span class="flex-1 min-w-0 block">
            <span class="block text-sm font-medium leading-tight truncate"
              >{{ f.name }}
              <span class="text-muted font-normal">
                · {{ f.manufacturer }}</span
              >
            </span>
            <span class="block text-xs text-muted leading-tight"
              >{{ f.material }} · {{ f.color }}</span
            >
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
          Print
          {{
            selected.size > 0
              ? `${selected.size} label${selected.size > 1 ? "s" : ""}`
              : ""
          }}
        </UButton>
      </template>
    </UCard>

    <FilamentPrintSheet :selected-filaments="selectedFilaments" />
  </UContainer>
</template>

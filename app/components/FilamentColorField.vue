<script lang="ts" setup>
import type { ColorLookupItem } from "~/types/filament";

const colorId = defineModel<number | undefined>();
const props = defineProps<{
  colors: ColorLookupItem[] | null | undefined;
  colorOptions: { label: string; value: number }[];
  refreshColors: () => Promise<unknown>;
}>();

const toast = useToast();
const saving = ref(false);

const selectedColor = computed(() =>
  props.colors?.find((color) => color.id === colorId.value),
);
const selectedColorHex = computed(() => selectedColor.value?.hex ?? null);
const pickerValue = computed(() => selectedColorHex.value ?? "#000000");

async function updateColorHex(event: Event) {
  const color = selectedColor.value;
  const hex = (event.target as HTMLInputElement).value;
  if (!color || color.hex.toLowerCase() === hex.toLowerCase()) return;

  saving.value = true;
  try {
    await $fetch(`/api/colors/${color.id}`, {
      method: "PUT",
      body: { name: color.name, hex },
    });
    await props.refreshColors();
  } catch (err) {
    console.error("Failed to update color:", err);
    toast.add({ title: "Error updating color", color: "error" });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <UFormField label="Color">
    <div class="flex gap-2 items-center">
      <USelect
        v-model="colorId"
        :items="props.colorOptions"
        class="flex-1"
        placeholder="Select color..."
      />
      <input
        :disabled="!selectedColor || saving"
        :value="pickerValue"
        class="size-9 rounded border border-default bg-transparent shrink-0 disabled:opacity-40"
        title="Pick color"
        type="color"
        @change="updateColorHex"
      />
      <span class="w-20 text-xs text-muted tabular-nums">
        {{ selectedColorHex ?? "No color" }}
      </span>
    </div>
  </UFormField>
</template>

<script lang="ts" setup>
const props = defineProps<{
  modelValue: {
    name: string;
    materialId?: number;
    manufacturerId?: number;
    colorId?: number;
    diameter: number;
    printTempMin: number;
    printTempMax: number;
    featureIds: number[];
    ean: string;
  };
  imageUrl?: string | null;
  uploading?: boolean;
  imagePreviewUrl?: string | null;
  imageFileName?: string | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: any];
  "image-change": [event: Event];
  "open-scanner": [];
}>();

const { colors, features, manufacturerOptions, materialOptions, colorOptions } =
  useFilamentLookups();

const selectedColorHex = computed(() => {
  if (!props.modelValue.colorId || !colors.value) return null;
  return (
    colors.value?.find((c) => c.id === props.modelValue.colorId)?.hex ?? null
  );
});
</script>

<template>
  <div class="space-y-4">
    <UFormField label="EAN">
      <div class="flex gap-2">
        <UInput
          v-model="modelValue.ean"
          class="flex-1"
          placeholder="Scan or type EAN / QR…"
        />
        <UButton
          icon="i-lucide-scan-barcode"
          variant="outline"
          @click="emit('open-scanner')"
        >
          <slot name="scan-button-label" />
        </UButton>
      </div>
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField class="col-span-2" label="Filament Name">
        <UInput
          v-model="modelValue.name"
          class="w-full"
          placeholder="e.g. Rapid PLA+, ecoPLA…"
          required
        />
      </UFormField>

      <UFormField label="Material">
        <USelect
          v-model="modelValue.materialId"
          :items="materialOptions"
          class="w-full"
          placeholder="Select…"
        />
      </UFormField>

      <UFormField label="Manufacturer">
        <USelect
          v-model="modelValue.manufacturerId"
          :items="manufacturerOptions"
          class="w-full"
          placeholder="Select..."
        />
      </UFormField>
    </div>

    <UFormField label="Color">
      <div class="flex gap-2 items-center">
        <USelect
          v-model="modelValue.colorId"
          :items="colorOptions"
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
          v-for="feat in features"
          :key="feat.id"
          class="flex items-center gap-1.5 text-sm cursor-pointer select-none"
        >
          <input
            v-model="modelValue.featureIds"
            :value="feat.id"
            class="rounded"
            type="checkbox"
          />
          {{ feat.name }}
        </label>
      </div>
    </UFormField>

    <div class="border-t border-default pt-4 space-y-4">
      <UFormField label="Diameter">
        <USelect
          v-model="modelValue.diameter"
          :items="[
            { label: '1.75 mm', value: 1.75 },
            { label: '2.85 mm', value: 2.85 },
          ]"
          class="w-full"
        />
      </UFormField>

      <div class="grid grid-cols-2 gap-4">
        <UFormField label="Min Temp (°C)">
          <UInput
            v-model="modelValue.printTempMin"
            max="350"
            min="150"
            required
            type="number"
          />
        </UFormField>
        <UFormField label="Max Temp (°C)">
          <UInput
            v-model="modelValue.printTempMax"
            max="350"
            min="150"
            required
            type="number"
          />
        </UFormField>
      </div>

      <UFormField label="Image">
        <div class="space-y-2">
          <NuxtImg
            v-if="imageUrl || imagePreviewUrl"
            :src="imageUrl || imagePreviewUrl!"
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
            >
              {{ imageFileName || "Upload Image" }}
            </UButton>
            <input
              accept="image/*"
              class="hidden"
              type="file"
              @change="emit('image-change', $event)"
            />
          </label>
        </div>
      </UFormField>
    </div>

    <slot name="footer" />
  </div>
</template>

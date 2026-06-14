<script lang="ts" setup>
import { reactive, ref, watch } from "vue";
import type { FilamentRecord } from "~/types/filament";

const route = useRoute();
const toast = useToast();

const {
  data: filament,
  pending,
  error,
  refresh,
} = await useFetch<FilamentRecord>(`/api/filaments/${route.params.id}`);

useRealtimeUpdates((event, value) => {
  if (event === "data:changed" && !deleting.value && !leavingPage.value)
    refresh();
  if (event === "qr:scanned" && value && /^\d+$/.test(value)) {
    const t = toast.add({
      title: "QR Code Scanned",
      description: "Another device scanned a spool. Tap to open it.",
      icon: "i-lucide-scan-qr-code",
      duration: 8000,
      onClick: () => {
        toast.remove(t.id);
        navigateTo(`/filaments/${value}`);
      },
    });
  }
});

const saving = ref(false);
const deleting = ref(false);
const leavingPage = ref(false);
const showDeleteConfirm = ref(false);
const scannerOpen = ref(false);

async function deleteFilament() {
  deleting.value = true;
  leavingPage.value = true;
  try {
    await $fetch(`/api/filaments/${route.params.id}`, { method: "DELETE" });
    await navigateTo("/");
  } catch {
    leavingPage.value = false;
    toast.add({ title: "Error deleting filament", color: "error" });
  } finally {
    deleting.value = false;
    showDeleteConfirm.value = false;
  }
}

const formState = reactive({
  name: "",
  materialId: undefined as number | undefined,
  manufacturerId: undefined as number | undefined,
  colorId: undefined as number | undefined,
  diameter: 1.75,
  printTempMin: 190,
  printTempMax: 220,
  featureIds: [] as number[],
  imageUrl: null as string | null,
  ean: "",
});

watch(
  filament,
  (val) => {
    if (!val) return;
    formState.name = val.name ?? "";
    formState.materialId = val.material?.id ?? undefined;
    formState.manufacturerId = val.manufacturerId ?? undefined;
    formState.colorId = val.color?.id ?? undefined;
    formState.diameter = val.diameter ?? 1.75;
    formState.printTempMin = val.printTempMin ?? 190;
    formState.printTempMax = val.printTempMax ?? 220;
    formState.featureIds = val.features.map((f) => f.id);
    formState.imageUrl = val.imageUrl ?? null;
    formState.ean = val.ean ?? "";
  },
  { immediate: true },
);

async function updateFilament() {
  if (!filament.value) return;
  saving.value = true;
  try {
    await $fetch<FilamentRecord>(`/api/filaments/${route.params.id}`, {
      method: "PUT",
      body: { ...formState },
    });
    await refresh();
    toast.add({ title: "Filament updated", icon: "i-lucide-check-circle" });
  } catch (err) {
    console.error(err);
    toast.add({ title: "Error updating filament", color: "error" });
  } finally {
    saving.value = false;
  }
}

const uploading = ref(false);
async function uploadImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  uploading.value = true;
  try {
    const form = new FormData();
    form.append("image", file);
    const result = await $fetch<{ imageUrl: string }>(
      `/api/filaments/${route.params.id}/image`,
      {
        method: "POST",
        body: form,
      },
    );
    formState.imageUrl = result.imageUrl;
    if (filament.value) filament.value.imageUrl = result.imageUrl;
    toast.add({ title: "Image updated", icon: "i-lucide-check-circle" });
  } catch (err) {
    console.error(err);
    toast.add({ title: "Image upload failed", color: "error" });
  } finally {
    uploading.value = false;
  }
}
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <div>
      <UButton color="neutral" icon="i-lucide-arrow-left" to="/" variant="ghost"
        >Back to Dashboard</UButton
      >
    </div>

    <UPageHeader
      :description="
        filament
          ? `${filament.material?.name ?? '—'} • ${filament.color?.name ?? '—'}`
          : ''
      "
      :title="filament?.name || 'Loading...'"
    />

    <div v-if="pending" class="text-neutral-500">Loading filament data...</div>
    <div v-else-if="error" class="text-error-500">
      Error loading filament: {{ error.message }}
    </div>

    <div
      v-else-if="filament"
      class="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6 items-start"
    >
      <!-- Left: Filament Details -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold leading-6">Filament Details</h3>
        </template>

        <form @submit.prevent="updateFilament">
          <FilamentForm
            v-model="formState"
            :image-url="formState.imageUrl"
            :uploading="uploading"
            @image-change="uploadImage"
            @open-scanner="scannerOpen = true"
          >
            <template #footer>
              <UButton
                :loading="saving"
                block
                class="mt-4"
                icon="i-lucide-save"
                type="submit"
              >
                Save Changes
              </UButton>
            </template>
          </FilamentForm>
        </form>

        <div class="mt-4 pt-4 border-t border-default flex justify-end gap-2">
          <template v-if="showDeleteConfirm">
            <UButton
              color="neutral"
              variant="ghost"
              @click="showDeleteConfirm = false"
              >Cancel</UButton
            >
            <UButton
              :loading="deleting"
              color="error"
              icon="i-lucide-trash-2"
              variant="solid"
              @click="deleteFilament"
            >
              Confirm Delete
            </UButton>
          </template>
          <UButton
            v-else
            color="error"
            icon="i-lucide-trash-2"
            variant="ghost"
            @click="showDeleteConfirm = true"
          >
            Delete Filament
          </UButton>
        </div>
      </UCard>

      <SpoolManager
        :filament-id="filament.id"
        :spools="filament.spools"
        @saved="refresh"
      />
    </div>

    <QrScannerModal v-model="scannerOpen" @scanned="formState.ean = $event" />
  </UContainer>
</template>

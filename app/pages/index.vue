<script lang="ts" setup>
const materialFilter = ref<number | null>(null)
const manufacturerFilter = ref<string | null>(null)
const featureFilter = ref<string[]>([])
const search = ref('')

const { data: filamentsRaw, refresh } = await useFetch('/api/filaments')
const { data: materialsData } = await useFetch('/api/materials')
const { data: featuresData } = await useFetch('/api/features')

const materialOptions = computed(() => {
  const base = [{ label: 'All Materials', value: null }]
  if (!materialsData.value) return base
  return [...base, ...materialsData.value.map(m => ({ label: m.name, value: m.id }))]
})

const manufacturerOptions = computed(() => {
  const base = [{ label: 'All Brands', value: null }]
  if (!filamentsRaw.value) return base
  const unique = new Set(filamentsRaw.value.map(f => f.manufacturer?.name).filter(Boolean))
  return [...base, ...Array.from(unique).sort().map(b => ({ label: b, value: b }))]
})

const featureOptions = computed(() => {
  if (!featuresData.value) return []
  return featuresData.value.map(f => ({ label: f.name, value: String(f.id) }))
})

const filaments = computed(() => {
  if (!filamentsRaw.value) return []

  return filamentsRaw.value
    .filter(f => {
      const matchMaterial = !materialFilter.value || f.materialId === materialFilter.value
      const searchTarget = [
        f.name,
        f.material?.name,
        f.color?.name,
        f.manufacturer?.name,
        ...(f.features?.map((ft: { name: string }) => ft.name) ?? []),
      ].filter(Boolean).join(' ').toLowerCase()
      const matchSearch = !search.value || searchTarget.includes(search.value.toLowerCase())
      const matchManufacturer = !manufacturerFilter.value || f.manufacturer?.name === manufacturerFilter.value
      const filamentFeatureIds = f.features?.map((ft: { id: number }) => String(ft.id)) ?? []
      const matchFeatures = featureFilter.value.length === 0 || featureFilter.value.every(fid => filamentFeatureIds.includes(fid))
      return matchMaterial && matchSearch && matchManufacturer && matchFeatures
    })
    .map(f => {
      const spool = f.spools?.[0]
      const initial = spool?.initialWeightG ?? 1000
      const remaining = spool?.remainingWeightG ?? 1000

      const statusMap = {
        sealed: { label: 'Sealed', color: 'success' },
        open: { label: 'Open', color: 'primary' },
        active: { label: 'Active', color: 'secondary' },
      } as const

      type StatusKey = keyof typeof statusMap
      const rawStatus = spool?.status
      const mappedStatus = rawStatus && rawStatus in statusMap
        ? statusMap[rawStatus as StatusKey]
        : statusMap.sealed

      return {
        id: f.id,
        materialId: f.materialId,
        featureIds: f.features?.map((ft: { id: number }) => ft.id) ?? [],
        name: f.name,
        material: f.material?.name ?? '—',
        manufacturer: f.manufacturer?.name ?? '—',
        color: f.color?.name ?? '—',
        colorHex: f.color?.hex ?? '#888888',
        diameter: `${f.diameter ?? 1.75} mm`,
        features: f.features?.map((ft: { name: string }) => ft.name).join(', ') ?? '',
        imageUrl: f.imageUrl ?? '/images/filaments/placeholder.png',
        imageAlt: `${f.manufacturer?.name} ${f.name}`,
        printTemp: `${f.printTempMin}–${f.printTempMax}°C`,
        purchased: spool?.purchasedAt ?? '—',
        remaining: `${remaining} g / ${initial} g`,
        status: mappedStatus.label,
        statusColor: mappedStatus.color,
        spoolCount: f.spools?.length ?? 0,
        totalWeightG: f.spools?.reduce((s, sp) => s + (sp.initialWeightG ?? 0), 0) ?? 0,
        remainingWeightG: f.spools?.reduce((s, sp) => s + (sp.remainingWeightG ?? 0), 0) ?? 0,
      }
    })
})

const scannerOpen = ref(false)
const addOpen = ref(false)

function onQrScanned(value: string) {
  const id = parseInt(value, 10)
  if (!isNaN(id)) navigateTo(`/filaments/${id}`)
}
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <UPageHeader
        description="Management software for 3D-printer filament."
        title="Overview"
    />

    <UCard>
      <div class="flex flex-wrap gap-3 items-center">
        <UInput v-model="search" class="flex-1 min-w-40" icon="i-lucide-search" placeholder="Search…"/>
        <div class="flex gap-2 shrink-0">
          <UButton
              aria-label="Scan QR code"
              color="neutral"
              icon="i-lucide-scan-qr-code"
              variant="outline"
              @click="scannerOpen = true"
          />
          <UButton
              aria-label="Add filament"
              color="primary"
              icon="i-lucide-plus"
              @click="addOpen = true"
          />
        </div>
        <div class="flex gap-3 shrink-0 w-full sm:w-auto">
          <USelect
              v-model="materialFilter"
              :items="materialOptions"
              aria-label="Filter by material"
              class="flex-1 sm:w-40"
          />
          <USelect
              v-model="manufacturerFilter"
              :items="manufacturerOptions"
              aria-label="Filter by brand"
              class="flex-1 sm:w-40"
          />
        </div>
      </div>
      <UCheckboxGroup
          v-if="featureOptions.length"
          v-model="featureFilter"
          :items="featureOptions"
          class="mt-3"
          orientation="horizontal"
      />
    </UCard>

    <QrScannerModal v-model="scannerOpen" @scanned="onQrScanned" />
    <AddFilamentModal v-model="addOpen" @created="refresh" />

    <div class="grid gap-4 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
      <NuxtLink
          v-for="f in filaments"
          :key="f.id"
          :to="`/filaments/${f.id}`"
          class="block transition-transform hover:scale-[1.02] focus:outline-none"
      >
        <FilamentCard v-bind="f"/>
      </NuxtLink>
    </div>
  </UContainer>
</template>

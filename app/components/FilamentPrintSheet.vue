<script lang="ts" setup>
interface FilamentRow {
  id: number;
  name: string;
  material: string;
  color: string;
  colorHex: string;
  manufacturer: string;
}

defineProps<{
  selectedFilaments: FilamentRow[];
}>();
</script>

<template>
  <Teleport to="body">
    <div class="print-sheet">
      <div class="label-grid">
        <div v-for="f in selectedFilaments" :key="f.id" class="label-card">
          <Qrcode
            :value="String(f.id)"
            black-color="#000000"
            class="qr"
            white-color="#ffffff"
          />
          <div class="label-info">
            <p class="label-name">{{ f.name }}</p>
            <p class="label-meta label-muted">{{ f.manufacturer }}</p>
            <p class="label-meta">{{ f.material }}</p>
            <p class="label-color">
              <span class="label-dot" :style="{ background: f.colorHex }" />
              {{ f.color }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
.print-sheet {
  display: none;
}

@media print {
  @page {
    margin: 8mm;
  }

  html,
  body {
    color-scheme: light !important;
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  body > #__nuxt,
  body > #teleports,
  body > nav,
  body > header {
    display: none !important;
  }

  .print-sheet {
    display: block !important;
    color: black;
    background: white;
  }

  .label-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4mm;
    align-content: start;
  }

  .label-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 3mm;
    border: 0.5pt solid #ccc;
    border-radius: 3mm;
    padding: 4mm;
    page-break-inside: avoid;
  }

  .qr {
    width: 28mm !important;
    height: 28mm !important;
    flex-shrink: 0;
  }

  .qr svg {
    width: 100%;
    height: 100%;
  }

  .label-info {
    text-align: left;
    flex: 1;
    min-width: 0;
  }

  .label-name {
    font-size: 8pt;
    font-weight: 600;
    margin: 0;
    color: black;
  }

  .label-meta {
    font-size: 6pt;
    color: #555;
    margin: 0;
  }

  .label-color {
    font-size: 6pt;
    margin: 0.5mm 0 0;
    display: flex;
    align-items: center;
    gap: 1mm;
    color: #555;
  }

  .label-dot {
    display: inline-block;
    width: 2mm;
    height: 2mm;
    border-radius: 50%;
    border: 0.3pt solid #aaa;
    flex-shrink: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>

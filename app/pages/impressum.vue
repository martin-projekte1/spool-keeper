<script lang="ts" setup></script>
<template>
  <UContainer class="py-8 max-w-xl space-y-6">
    <UPageHeader
      description="Offenlegung gemäß § 25 Mediengesetz"
      title="Impressum"
    />

    <UCard>
      <template #header
        ><p class="font-semibold">
          Diensteanbieter &amp; Medieninhaber
        </p></template
      >
      <p><strong>Martin Reisinger</strong><br />Linz</p>
    </UCard>

    <UCard>
      <template #header><p class="font-semibold">Kontakt</p></template>
      <p>
        E-Mail:
        <a
          class="text-primary underline"
          href="mailto:martin.projekte1@gmail.com"
          >martin.projekte1@gmail.com</a
        >
      </p>
    </UCard>

    <UCard>
      <template #header
        ><p class="font-semibold">Analyse & Statistik</p></template
      >
      <p>
        Diese Website verwendet <strong>GoatCounter</strong> zur anonymen
        Besucherstatistik. GoatCounter speichert keine personenbezogenen Daten
        und setzt keine Cookies. Weitere Informationen:
        <a
          class="text-primary underline"
          href="https://www.goatcounter.com/help/privacy"
          target="_blank"
        >
          goatcounter.com/help/privacy
        </a>
      </p>
    </UCard>

    <UCard>
      <template #header
        ><p class="font-semibold">Unternehmensgegenstand</p></template
      >
      <p>Uni Projekt von Martin Reisinger.</p>
    </UCard>
  </UContainer>
</template>

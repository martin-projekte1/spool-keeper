import type { ColorLookupItem, LookupItem } from "~/types/filament";

export function useFilamentLookups() {
  const { data: manufacturers } = useFetch<LookupItem[]>("/api/manufacturers");
  const { data: materials } = useFetch<LookupItem[]>("/api/materials");
  const { data: colors } = useFetch<ColorLookupItem[]>("/api/colors");
  const { data: features } = useFetch<LookupItem[]>("/api/features");

  const manufacturerOptions = computed(() =>
    (manufacturers.value ?? []).map((item) => ({
      label: item.name,
      value: item.id,
    })),
  );
  const materialOptions = computed(() =>
    (materials.value ?? []).map((item) => ({
      label: item.name,
      value: item.id,
    })),
  );
  const colorOptions = computed(() =>
    (colors.value ?? []).map((item) => ({ label: item.name, value: item.id })),
  );

  return {
    manufacturers,
    materials,
    colors,
    features,
    manufacturerOptions,
    materialOptions,
    colorOptions,
  };
}

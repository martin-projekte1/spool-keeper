export interface LookupItem {
  id: number
  name: string
}

export interface ColorLookupItem extends LookupItem {
  hex: string
}

export type SpoolStatus = 'sealed' | 'open' | 'active'

export interface Spool {
  id: number
  status: SpoolStatus
  remainingWeightG: number
  initialWeightG: number
  purchasedAt: string | null
}

export interface FilamentRecord {
  id: number
  name: string
  materialId: number | null
  material: LookupItem | null
  colorId: number | null
  color: ColorLookupItem | null
  diameter: number | null
  ean: string | null
  manufacturerId: number | null
  manufacturer: LookupItem | null
  features: LookupItem[]
  imageUrl: string | null
  printTempMin: number | null
  printTempMax: number | null
  spools: Spool[]
}

export interface EditableSpool {
  id: number | null
  status: SpoolStatus
  remainingWeightG: number
  initialWeightG: number
  purchasedAt: string
}

export const SPOOL_STATUS_OPTIONS: { label: string; value: SpoolStatus }[] = [
  { label: 'Sealed', value: 'sealed' },
  { label: 'Open', value: 'open' },
  { label: 'Active', value: 'active' },
]

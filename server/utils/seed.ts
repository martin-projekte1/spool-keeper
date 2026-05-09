import { manufacturers, filaments, spools, materials, featuresTable, colors, filamentFeatures } from '#server/db/schema'
import { eq } from 'drizzle-orm'

export async function seedForUser(userId: string) {
  await db.transaction(async (tx) => {
    await tx.delete(spools).where(eq(spools.userId, userId))
    await tx.delete(filaments).where(eq(filaments.userId, userId))
    await tx.delete(manufacturers).where(eq(manufacturers.userId, userId))
    await tx.delete(materials).where(eq(materials.userId, userId))
    await tx.delete(featuresTable).where(eq(featuresTable.userId, userId))
    await tx.delete(colors).where(eq(colors.userId, userId))

    const [elegoo] = await tx.insert(manufacturers).values({ userId, name: 'Elegoo' }).returning()
    const [esun] = await tx.insert(manufacturers).values({ userId, name: 'eSUN' }).returning()
    const [polymaker] = await tx.insert(manufacturers).values({ userId, name: 'Polymaker' }).returning()
    const [bambu] = await tx.insert(manufacturers).values({ userId, name: 'Bambu Lab' }).returning()

    const [pla] = await tx.insert(materials).values({ userId, name: 'PLA' }).returning()
    const [asa] = await tx.insert(materials).values({ userId, name: 'ASA' }).returning()

    const [hf] = await tx.insert(featuresTable).values({ userId, name: 'HF' }).returning()
    const [plus] = await tx.insert(featuresTable).values({ userId, name: 'Plus' }).returning()
    const [matte] = await tx.insert(featuresTable).values({ userId, name: 'Matte' }).returning()

    const [black] = await tx.insert(colors).values({ userId, name: 'Black', hex: '#111111' }).returning()
    const [gray] = await tx.insert(colors).values({ userId, name: 'Gray', hex: '#8a8a8a' }).returning()
    const [lavaRed] = await tx.insert(colors).values({ userId, name: 'Lava Red', hex: '#cf3c3c' }).returning()
    const [armyGreen] = await tx.insert(colors).values({ userId, name: 'Army Green', hex: '#4a5c3a' }).returning()
    const [green] = await tx.insert(colors).values({ userId, name: 'Green', hex: '#3a7d44' }).returning()

    if (!elegoo || !esun || !polymaker || !bambu || !pla || !asa || !hf || !plus || !matte
      || !black || !gray || !lavaRed || !armyGreen || !green) {
      throw createError({ statusCode: 500, message: 'Seed lookup data could not be created' })
    }

    const [fil1] = await tx.insert(filaments).values({
      userId, name: 'Rapid PLA+ HF', materialId: pla.id, manufacturerId: elegoo.id,
      colorId: black.id, diameter: 1.75, printTempMin: 200, printTempMax: 230,
      imageUrl: '/images/filaments/pla-plus-hf-black.webp',
    }).returning()

    const [fil2] = await tx.insert(filaments).values({
      userId, name: 'ASA+', materialId: asa.id, manufacturerId: esun.id,
      colorId: gray.id, diameter: 1.75, printTempMin: 250, printTempMax: 280,
      imageUrl: '/images/filaments/asa-plus-gray.webp',
    }).returning()

    const [fil3] = await tx.insert(filaments).values({
      userId, name: 'PolyTerra PLA', materialId: pla.id, manufacturerId: polymaker.id,
      colorId: lavaRed.id, diameter: 1.75, printTempMin: 190, printTempMax: 230,
      imageUrl: '/images/filaments/pla-poly-terra-red.webp',
    }).returning()

    const [fil4] = await tx.insert(filaments).values({
      userId, name: 'PolyTerra PLA', materialId: pla.id, manufacturerId: polymaker.id,
      colorId: armyGreen.id, diameter: 1.75, printTempMin: 190, printTempMax: 230,
      imageUrl: '/images/filaments/pla-poly-terra-green.webp',
    }).returning()

    const [fil5] = await tx.insert(filaments).values({
      userId, name: 'PLA', materialId: pla.id, manufacturerId: bambu.id,
      colorId: green.id, diameter: 1.75, printTempMin: 190, printTempMax: 220,
      imageUrl: '/images/filaments/pla-bambu-green.webp',
    }).returning()

    if (!fil1 || !fil2 || !fil3 || !fil4 || !fil5) {
      throw createError({ statusCode: 500, message: 'Filaments could not be created' })
    }

    await tx.insert(filamentFeatures).values([
      { filamentId: fil1.id, featureId: hf.id },
      { filamentId: fil1.id, featureId: plus.id },
      { filamentId: fil2.id, featureId: plus.id },
      { filamentId: fil3.id, featureId: matte.id },
      { filamentId: fil4.id, featureId: matte.id },
    ])

    await tx.insert(spools).values([
      { userId, filamentId: fil1.id, purchasedAt: '2026-02-28', initialWeightG: 1000, remainingWeightG: 620, status: 'open' },
      { userId, filamentId: fil2.id, purchasedAt: '2026-03-18', initialWeightG: 1000, remainingWeightG: 1000, status: 'sealed' },
      { userId, filamentId: fil3.id, purchasedAt: '2026-03-18', initialWeightG: 1000, remainingWeightG: 1000, status: 'sealed' },
      { userId, filamentId: fil4.id, purchasedAt: '2026-03-18', initialWeightG: 1000, remainingWeightG: 1000, status: 'sealed' },
      { userId, filamentId: fil5.id, purchasedAt: '2026-03-18', initialWeightG: 1000, remainingWeightG: 1000, status: 'active' },
    ])
  })
}

import { manufacturers, filaments, spools, materials, featuresTable, colors, filamentFeatures } from '#server/db/schema'
import { clearUserData } from './ownership'
import { db } from './db'

export async function seedForUser(userId: string) {
  db.transaction((tx) => {
    clearUserData(tx, userId)

    const elegoo = tx.insert(manufacturers).values({ userId, name: 'Elegoo' }).returning().get()
    const esun = tx.insert(manufacturers).values({ userId, name: 'eSUN' }).returning().get()
    const polymaker = tx.insert(manufacturers).values({ userId, name: 'Polymaker' }).returning().get()
    const bambu = tx.insert(manufacturers).values({ userId, name: 'Bambu Lab' }).returning().get()

    const pla = tx.insert(materials).values({ userId, name: 'PLA' }).returning().get()
    const asa = tx.insert(materials).values({ userId, name: 'ASA' }).returning().get()

    const hf = tx.insert(featuresTable).values({ userId, name: 'HF' }).returning().get()
    const plus = tx.insert(featuresTable).values({ userId, name: 'Plus' }).returning().get()
    const matte = tx.insert(featuresTable).values({ userId, name: 'Matte' }).returning().get()

    const black = tx.insert(colors).values({ userId, name: 'Black', hex: '#363636' }).returning().get()
    const gray = tx.insert(colors).values({ userId, name: 'Gray', hex: '#8a8a8a' }).returning().get()
    const lavaRed = tx.insert(colors).values({ userId, name: 'Lava Red', hex: '#cf3c3c' }).returning().get()
    const armyGreen = tx.insert(colors).values({ userId, name: 'Army Green', hex: '#4a5c3a' }).returning().get()
    const green = tx.insert(colors).values({ userId, name: 'Green', hex: '#3a7d44' }).returning().get()

    if (!elegoo || !esun || !polymaker || !bambu || !pla || !asa || !hf || !plus || !matte
      || !black || !gray || !lavaRed || !armyGreen || !green) {
      throw createError({ statusCode: 500, message: 'Seed lookup data could not be created' })
    }

    const fil1 = tx.insert(filaments).values({
      userId, name: 'Rapid PLA+ HF', materialId: pla.id, manufacturerId: elegoo.id,
      colorId: black.id, diameter: 1.75, printTempMin: 200, printTempMax: 230,
      imageUrl: '/images/filaments/pla-plus-hf-black.webp',
    }).returning().get()

    const fil2 = tx.insert(filaments).values({
      userId, name: 'ASA+', materialId: asa.id, manufacturerId: esun.id,
      colorId: gray.id, diameter: 1.75, printTempMin: 250, printTempMax: 280,
      imageUrl: '/images/filaments/asa-plus-gray.webp',
    }).returning().get()

    const fil3 = tx.insert(filaments).values({
      userId, name: 'PolyTerra PLA', materialId: pla.id, manufacturerId: polymaker.id,
      colorId: lavaRed.id, diameter: 1.75, printTempMin: 190, printTempMax: 230,
      imageUrl: '/images/filaments/pla-poly-terra-red.webp',
    }).returning().get()

    const fil4 = tx.insert(filaments).values({
      userId, name: 'PolyTerra PLA', materialId: pla.id, manufacturerId: polymaker.id,
      colorId: armyGreen.id, diameter: 1.75, printTempMin: 190, printTempMax: 230,
      imageUrl: '/images/filaments/pla-poly-terra-green.webp',
    }).returning().get()

    const fil5 = tx.insert(filaments).values({
      userId, name: 'PLA', materialId: pla.id, manufacturerId: bambu.id,
      colorId: green.id, diameter: 1.75, printTempMin: 190, printTempMax: 220,
      imageUrl: '/images/filaments/pla-bambu-green.webp',
    }).returning().get()

    if (!fil1 || !fil2 || !fil3 || !fil4 || !fil5) {
      throw createError({ statusCode: 500, message: 'Filaments could not be created' })
    }

    tx.insert(filamentFeatures).values([
      { filamentId: fil1.id, featureId: hf.id },
      { filamentId: fil1.id, featureId: plus.id },
      { filamentId: fil2.id, featureId: plus.id },
      { filamentId: fil3.id, featureId: matte.id },
      { filamentId: fil4.id, featureId: matte.id },
    ]).run()

    tx.insert(spools).values([
      { userId, filamentId: fil1.id, purchasedAt: '2026-02-28', initialWeightG: 1000, remainingWeightG: 620, status: 'open' },
      { userId, filamentId: fil2.id, purchasedAt: '2026-03-18', initialWeightG: 1000, remainingWeightG: 1000, status: 'sealed' },
      { userId, filamentId: fil3.id, purchasedAt: '2026-03-18', initialWeightG: 1000, remainingWeightG: 1000, status: 'sealed' },
      { userId, filamentId: fil4.id, purchasedAt: '2026-03-18', initialWeightG: 1000, remainingWeightG: 1000, status: 'sealed' },
      { userId, filamentId: fil5.id, purchasedAt: '2026-03-18', initialWeightG: 1000, remainingWeightG: 1000, status: 'active' },
    ]).run()
  })
}

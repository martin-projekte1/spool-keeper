import { filaments, spools, filamentFeatures } from "#server/db/schema";
import { s } from "#server/utils/openapi-schemas";

defineRouteMeta({
  openAPI: {
    tags: ["Filaments"],
    summary: "Create filament",
    description:
      "Creates a new filament and automatically creates its first spool (status: sealed) in a single transaction.",
    security: [{ sessionCookie: [] }],
    requestBody: {
      required: true,
      content: { "application/json": { schema: s.filamentInsert } },
    },
    responses: {
      200: {
        description: "Created filament",
        content: { "application/json": { schema: s.filament } },
      },
      400: { description: "Name is required" },
      401: { description: "Not authenticated" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const body = await readBody(event);

  if (!body?.name?.trim())
    throw createError({ statusCode: 400, statusMessage: "Name is required" });

  const refs = await validateOwnedFilamentReferences(userId, {
    materialId: body.materialId,
    manufacturerId: body.manufacturerId,
    colorId: body.colorId,
    featureIds: body.featureIds,
  });

  const newFilament = db.transaction((tx) => {
    const insertedFilament = tx
      .insert(filaments)
      .values({
        userId,
        name: body.name.trim(),
        materialId: refs.materialId,
        manufacturerId: refs.manufacturerId,
        colorId: refs.colorId,
        diameter: body.diameter ?? 1.75,
        printTempMin: body.printTempMin,
        printTempMax: body.printTempMax,
        imageUrl: body.imageUrl ?? null,
        ean: body.ean ?? null,
      })
      .returning()
      .get();

    if (!insertedFilament)
      throw createError({ statusCode: 500, message: "Insert failed" });

    if (refs.featureIds.length) {
      tx.insert(filamentFeatures)
        .values(
          refs.featureIds.map((featureId) => ({
            filamentId: insertedFilament.id,
            featureId,
          })),
        )
        .run();
    }

    tx.insert(spools)
      .values({
        userId,
        filamentId: insertedFilament.id,
        purchasedAt: body.purchasedAt ?? null,
        initialWeightG: body.initialWeightG ?? 1000,
        remainingWeightG: body.remainingWeightG ?? body.initialWeightG ?? 1000,
        status: "sealed",
      })
      .run();

    return insertedFilament;
  });

  notifyUser(userId, "data:changed");
  return newFilament;
});

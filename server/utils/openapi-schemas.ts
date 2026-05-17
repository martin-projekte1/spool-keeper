import {createInsertSchema, createSelectSchema} from 'drizzle-zod'
import {z} from 'zod'
import {zodToJsonSchema as _zodToJsonSchema} from 'zod-to-json-schema'
import {colors, featuresTable, filaments, manufacturers, materials, spools} from '#server/db/schema'

// drizzle-zod generates Zod v3 types; zod-to-json-schema and Nitro's SchemaObject
// both expect slightly different type signatures. Casting here keeps all TypeScript errors
// in one place instead of spreading `as any` across every endpoint file.
const jschema = (schema: unknown) => _zodToJsonSchema(schema as Parameters<typeof _zodToJsonSchema>[0]) as any

// ── Lookup tables ──────────────────────────────────────────────────────────────

const manufacturerSelect = createSelectSchema(manufacturers)
const manufacturerInsert = createInsertSchema(manufacturers).omit({id: true, userId: true})

export const s = {
  manufacturer: jschema(manufacturerSelect),
  manufacturerList: jschema(z.array(manufacturerSelect)),
  manufacturerInsert: jschema(manufacturerInsert),

  material: jschema(createSelectSchema(materials)),
  materialList: jschema(z.array(createSelectSchema(materials))),
  materialInsert: jschema(createInsertSchema(materials).omit({id: true, userId: true})),

  color: jschema(createSelectSchema(colors)),
  colorList: jschema(z.array(createSelectSchema(colors))),
  colorInsert: jschema(createInsertSchema(colors).omit({id: true, userId: true})),

  feature: jschema(createSelectSchema(featuresTable)),
  featureList: jschema(z.array(createSelectSchema(featuresTable))),
  featureInsert: jschema(createInsertSchema(featuresTable).omit({id: true, userId: true})),

  // ── Spool ────────────────────────────────────────────────────────────────────

  spool: jschema(createSelectSchema(spools)),
  spoolList: jschema(z.array(createSelectSchema(spools))),

  spoolInsert: jschema(
    createInsertSchema(spools).omit({id: true, userId: true}).extend({
      filamentId: z.number(),
    }),
  ),

  spoolUpdate: jschema(z.object({
    status: z.enum(['sealed', 'open', 'active']).optional(),
    remainingWeightG: z.number().optional(),
    purchasedAt: z.string().nullable().optional(),
  })),

  // ── Filament ─────────────────────────────────────────────────────────────────

  filamentInsert: jschema(
    createInsertSchema(filaments)
      .omit({id: true, userId: true, imageUrl: true, createdAt: true})
      .extend({
        featureIds: z.array(z.number()).optional(),
        initialWeightG: z.number().optional(),
        remainingWeightG: z.number().optional(),
        purchasedAt: z.string().nullable().optional(),
      }),
  ),

  filament: jschema(
    createSelectSchema(filaments).extend({
      manufacturer: createSelectSchema(manufacturers).nullable(),
      material: createSelectSchema(materials).nullable(),
      color: createSelectSchema(colors).nullable(),
      features: z.array(createSelectSchema(featuresTable)),
      spools: z.array(createSelectSchema(spools)),
    }),
  ),

  filamentList: jschema(
    z.array(
      createSelectSchema(filaments).extend({
        manufacturer: createSelectSchema(manufacturers).nullable(),
        material: createSelectSchema(materials).nullable(),
        color: createSelectSchema(colors).nullable(),
        features: z.array(createSelectSchema(featuresTable)),
        spools: z.array(createSelectSchema(spools)),
      }),
    ),
  ),

  ok: jschema(z.object({ok: z.literal(true)})),
}

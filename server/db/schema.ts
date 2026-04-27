import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const manufacturers = sqliteTable('manufacturers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  website: text('website'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const materials = sqliteTable('materials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
})

export const featuresTable = sqliteTable('features', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
})

export const colors = sqliteTable('colors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  hex: text('hex').notNull(),
})

export const filaments = sqliteTable('filaments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  materialId: integer('material_id').references(() => materials.id),
  manufacturerId: integer('manufacturer_id').references(() => manufacturers.id),
  colorId: integer('color_id').references(() => colors.id),
  diameter: real('diameter').default(1.75),
  printTempMin: integer('print_temp_min'),
  printTempMax: integer('print_temp_max'),
  imageUrl: text('image_url'),
  ean: text('ean'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const filamentFeatures = sqliteTable('filament_features', {
  filamentId: integer('filament_id').notNull().references(() => filaments.id, { onDelete: 'cascade' }),
  featureId: integer('feature_id').notNull().references(() => featuresTable.id, { onDelete: 'cascade' }),
})

export const spools = sqliteTable('spools', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  filamentId: integer('filament_id').references(() => filaments.id),
  purchasedAt: text('purchased_at'),
  initialWeightG: real('initial_weight_g'),
  remainingWeightG: real('remaining_weight_g'),
  status: text('status', { enum: ['sealed', 'open', 'active'] }).default('sealed'),
  dryingStartedAt: text('drying_started_at'),
  dryingFinishedAt: text('drying_finished_at'),
})

import { sqliteTable, AnySQLiteColumn, foreignKey, integer, text, real } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const filaments = sqliteTable("filaments", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	userId: text("user_id").notNull(),
	name: text().notNull(),
	manufacturerId: integer("manufacturer_id").references(() => manufacturers.id),
	diameter: real().default(1.75),
	printTempMin: integer("print_temp_min"),
	printTempMax: integer("print_temp_max"),
	imageUrl: text("image_url"),
	createdAt: text("created_at").default("sql`(datetime('now'))`"),
	ean: text(),
	materialId: integer("material_id"),
	colorId: integer("color_id"),
});

export const manufacturers = sqliteTable("manufacturers", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	userId: text("user_id").notNull(),
	name: text().notNull(),
	createdAt: text("created_at").default("sql`(datetime('now'))`"),
	website: text(),
});

export const spools = sqliteTable("spools", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	userId: text("user_id").notNull(),
	filamentId: integer("filament_id").references(() => filaments.id),
	purchasedAt: text("purchased_at"),
	initialWeightG: real("initial_weight_g"),
	remainingWeightG: real("remaining_weight_g"),
	status: text().default("sealed"),
	dryingStartedAt: text("drying_started_at"),
	dryingFinishedAt: text("drying_finished_at"),
	notes: text(),
});

export const colors = sqliteTable("colors", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	userId: text("user_id").notNull(),
	name: text().notNull(),
	hex: text().notNull(),
});

export const features = sqliteTable("features", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	userId: text("user_id").notNull(),
	name: text().notNull(),
});

export const materials = sqliteTable("materials", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	userId: text("user_id").notNull(),
	name: text().notNull(),
});

export const filamentFeatures = sqliteTable("filament_features", {
	filamentId: integer("filament_id").notNull().references(() => filaments.id, { onDelete: "cascade" } ),
	featureId: integer("feature_id").notNull().references(() => features.id, { onDelete: "cascade" } ),
});


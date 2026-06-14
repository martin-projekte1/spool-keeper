import { relations } from "drizzle-orm/relations";
import {
  manufacturers,
  filaments,
  spools,
  features,
  filamentFeatures,
} from "./schema";

export const filamentsRelations = relations(filaments, ({ one, many }) => ({
  manufacturer: one(manufacturers, {
    fields: [filaments.manufacturerId],
    references: [manufacturers.id],
  }),
  spools: many(spools),
  filamentFeatures: many(filamentFeatures),
}));

export const manufacturersRelations = relations(manufacturers, ({ many }) => ({
  filaments: many(filaments),
}));

export const spoolsRelations = relations(spools, ({ one }) => ({
  filament: one(filaments, {
    fields: [spools.filamentId],
    references: [filaments.id],
  }),
}));

export const filamentFeaturesRelations = relations(
  filamentFeatures,
  ({ one }) => ({
    feature: one(features, {
      fields: [filamentFeatures.featureId],
      references: [features.id],
    }),
    filament: one(filaments, {
      fields: [filamentFeatures.filamentId],
      references: [filaments.id],
    }),
  }),
);

export const featuresRelations = relations(features, ({ many }) => ({
  filamentFeatures: many(filamentFeatures),
}));

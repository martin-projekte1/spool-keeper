CREATE TABLE `colors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`hex` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `features` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `filament_features` (
	`filament_id` integer NOT NULL,
	`feature_id` integer NOT NULL,
	FOREIGN KEY (`filament_id`) REFERENCES `filaments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`feature_id`) REFERENCES `features`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `materials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_spools` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`filament_id` integer,
	`purchased_at` text,
	`initial_weight_g` real,
	`remaining_weight_g` real,
	`status` text DEFAULT 'sealed',
	`drying_started_at` text,
	`drying_finished_at` text,
	FOREIGN KEY (`filament_id`) REFERENCES `filaments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_spools`("id", "user_id", "filament_id", "purchased_at", "initial_weight_g", "remaining_weight_g", "status", "drying_started_at", "drying_finished_at") SELECT "id", "user_id", "filament_id", "purchased_at", "initial_weight_g", "remaining_weight_g", "status", "drying_started_at", "drying_finished_at" FROM `spools`;--> statement-breakpoint
DROP TABLE `spools`;--> statement-breakpoint
ALTER TABLE `__new_spools` RENAME TO `spools`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `filaments` ADD `user_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `filaments` ADD `material_id` integer REFERENCES materials(id);--> statement-breakpoint
ALTER TABLE `filaments` ADD `color_id` integer REFERENCES colors(id);--> statement-breakpoint
ALTER TABLE `filaments` ADD `ean` text;--> statement-breakpoint
ALTER TABLE `filaments` DROP COLUMN `material`;--> statement-breakpoint
ALTER TABLE `filaments` DROP COLUMN `color`;--> statement-breakpoint
ALTER TABLE `filaments` DROP COLUMN `color_hex`;--> statement-breakpoint
ALTER TABLE `filaments` DROP COLUMN `features`;--> statement-breakpoint
ALTER TABLE `manufacturers` ADD `user_id` text NOT NULL;
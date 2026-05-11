CREATE TABLE `filaments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`material` text NOT NULL,
	`manufacturer_id` integer,
	`color` text,
	`color_hex` text,
	`diameter` real DEFAULT 1.75,
	`print_temp_min` integer,
	`print_temp_max` integer,
	`features` text,
	`image_url` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `manufacturers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`website` text,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE `spools` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`filament_id` integer,
	`purchased_at` text,
	`initial_weight_g` real,
	`remaining_weight_g` real,
	`status` text DEFAULT 'new',
	`drying_started_at` text,
	`drying_finished_at` text,
	FOREIGN KEY (`filament_id`) REFERENCES `filaments`(`id`) ON UPDATE no action ON DELETE no action
);

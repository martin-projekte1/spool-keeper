PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_manufacturers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text DEFAULT 'default' NOT NULL,
	`name` text NOT NULL,
	`website` text,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
INSERT INTO `__new_manufacturers`("id", "user_id", "name", "website", "created_at") SELECT "id", "user_id", "name", "website", "created_at" FROM `manufacturers`;--> statement-breakpoint
DROP TABLE `manufacturers`;--> statement-breakpoint
ALTER TABLE `__new_manufacturers` RENAME TO `manufacturers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_materials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text DEFAULT 'default' NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_materials`("id", "user_id", "name") SELECT "id", "user_id", "name" FROM `materials`;--> statement-breakpoint
DROP TABLE `materials`;--> statement-breakpoint
ALTER TABLE `__new_materials` RENAME TO `materials`;
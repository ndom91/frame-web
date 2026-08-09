ALTER TABLE `frame` ADD `last_seen_at` integer;
--> statement-breakpoint
ALTER TABLE `frame` ADD `uptime_seconds` integer;
--> statement-breakpoint
CREATE TABLE `frame_api_key` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`frame_id` integer NOT NULL,
	`key_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`activated_at` integer,
	FOREIGN KEY (`frame_id`) REFERENCES `frame`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `frame_api_key_hash_idx` ON `frame_api_key` (`key_hash`);
--> statement-breakpoint
CREATE UNIQUE INDEX `frame_api_key_pending_frame_id_idx` ON `frame_api_key` (`frame_id`) WHERE `activated_at` is null;
--> statement-breakpoint
CREATE UNIQUE INDEX `frame_frameId_unique` ON `frame` (`frameId`);

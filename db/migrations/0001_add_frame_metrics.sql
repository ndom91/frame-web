ALTER TABLE `frame` ADD `storage_total_bytes` integer;
--> statement-breakpoint
ALTER TABLE `frame` ADD `storage_available_bytes` integer;
--> statement-breakpoint
ALTER TABLE `frame` ADD `active_image` text;

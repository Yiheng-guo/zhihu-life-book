CREATE TABLE `guide_cache` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `guide_counters` (
	`key` text PRIMARY KEY NOT NULL,
	`used` integer DEFAULT 0 NOT NULL,
	`expires` integer NOT NULL
);

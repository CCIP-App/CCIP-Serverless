CREATE TABLE `announcements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`announced_at` integer DEFAULT (unixepoch()),
	`message` text DEFAULT '{}' NOT NULL,
	`uri` text,
	`roles` text DEFAULT '[]' NOT NULL
);

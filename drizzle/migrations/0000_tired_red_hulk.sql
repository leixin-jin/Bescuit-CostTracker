CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`supplier_id` text NOT NULL,
	`category_id` text,
	`product_name` text NOT NULL,
	`quantity` real NOT NULL,
	`unit` text DEFAULT 'ud' NOT NULL,
	`unit_price` real NOT NULL,
	`tax_rate` real DEFAULT 0.1 NOT NULL,
	`total_price` real NOT NULL,
	`item_date` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_items_product` ON `invoice_items` (`product_name`);--> statement-breakpoint
CREATE INDEX `idx_items_supplier` ON `invoice_items` (`supplier_id`);--> statement-breakpoint
CREATE INDEX `idx_items_date` ON `invoice_items` (`item_date`);--> statement-breakpoint
CREATE INDEX `idx_items_category` ON `invoice_items` (`category_id`);--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`supplier_id` text NOT NULL,
	`invoice_number` text,
	`invoice_date` text NOT NULL,
	`total_amount` real,
	`status` text DEFAULT 'verified' NOT NULL,
	`notes` text,
	`raw_json` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_invoices_supplier` ON `invoices` (`supplier_id`);--> statement-breakpoint
CREATE INDEX `idx_invoices_date` ON `invoices` (`invoice_date`);--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`contact` text,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `suppliers_name_unique` ON `suppliers` (`name`);
--> statement-breakpoint
INSERT OR IGNORE INTO `categories` (`id`, `name`, `icon`, `sort_order`) VALUES
	('cat-aceite', 'Aceite', 'OL', 1),
	('cat-carne', 'Carne', 'ME', 2),
	('cat-pescado', 'Pescado', 'FI', 3),
	('cat-verdura', 'Verdura', 'VE', 4),
	('cat-fruta', 'Fruta', 'FR', 5),
	('cat-lacteo', 'Lácteo', 'DA', 6),
	('cat-bebida', 'Bebida', 'BE', 7),
	('cat-panaderia', 'Panadería', 'BA', 8),
	('cat-conservas', 'Conservas', 'CA', 9),
	('cat-limpieza', 'Limpieza', 'CL', 10),
	('cat-otros', 'Otros', 'OT', 99);

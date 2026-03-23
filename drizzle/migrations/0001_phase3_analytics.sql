ALTER TABLE `invoice_items`
ADD COLUMN `product_name_normalized` text NOT NULL DEFAULT '';
--> statement-breakpoint
UPDATE `invoice_items`
SET `product_name_normalized` = trim(
  lower(
    replace(
      replace(
        replace(
          replace(
            replace(`product_name`, '-', ' '),
            '/',
            ' '
          ),
          '(',
          ' '
        ),
        ')',
        ' '
      ),
      '  ',
      ' '
    )
  )
);
--> statement-breakpoint
UPDATE `invoice_items`
SET `product_name_normalized` = `product_name`
WHERE `product_name_normalized` IS NULL OR trim(`product_name_normalized`) = '';
--> statement-breakpoint
CREATE INDEX `idx_items_product_normalized`
ON `invoice_items` (`product_name_normalized`);
--> statement-breakpoint
CREATE INDEX `idx_items_product_unit_date`
ON `invoice_items` (`product_name_normalized`, `unit`, `item_date`);
--> statement-breakpoint
CREATE INDEX `idx_items_product_supplier_date`
ON `invoice_items` (`product_name_normalized`, `unit`, `supplier_id`, `item_date`);

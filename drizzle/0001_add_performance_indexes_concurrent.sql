-- Migration: 0001_add_performance_indexes_concurrent.sql
-- Description: Zero-downtime concurrent index creation for live production PostgreSQL clusters.
-- NOTE: Execute this script using psql without an enclosing transaction block (AUTOCOMMIT ON).

-- 1. Store Area and Status Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS stores_area_idx ON stores (area);
CREATE INDEX CONCURRENTLY IF NOT EXISTS stores_service_paused_idx ON stores (service_paused);

-- 2. Product Catalog Filtering Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS products_store_category_idx ON products (store_id, category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS products_store_in_stock_idx ON products (store_id, in_stock);

-- 3. Customer Resident and Phone Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS customers_phone_idx ON customers (phone);
CREATE INDEX CONCURRENTLY IF NOT EXISTS customers_building_idx ON customers (building);

-- 4. Order Query and Building Batching Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS orders_store_status_idx ON orders (store_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS orders_building_status_idx ON orders (building, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS orders_created_at_idx ON orders (created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS orders_customer_id_idx ON orders (customer_id);

-- 5. Authoritative Khata Credit Ledger Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS khata_transactions_customer_id_idx ON khata_transactions (customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS khata_transactions_store_id_idx ON khata_transactions (store_id);

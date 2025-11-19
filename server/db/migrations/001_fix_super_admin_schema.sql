-- =====================================================
-- MIGRATION 001: Fix Super Admin Portal Schema Issues
-- Date: 2025-11-19
-- Description: Aligns database schema with Super Admin spec
-- =====================================================

-- 1. Fix dynamic_categories table
-- Add color_dark column, rename label fields to name fields
ALTER TABLE dynamic_categories 
  ADD COLUMN IF NOT EXISTS color_dark VARCHAR(50),
  ADD COLUMN IF NOT EXISTS name_en VARCHAR(255),
  ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255);

-- Copy data from old columns to new columns
UPDATE dynamic_categories 
SET name_en = label_en, 
    name_ar = label_ar,
    color_dark = color
WHERE name_en IS NULL;

-- Set color_dark to slightly darker version of color (temporary default)
UPDATE dynamic_categories 
SET color_dark = color
WHERE color_dark IS NULL;

-- 2. Fix dynamic_badges table
-- Add category_filter column for badge criteria
ALTER TABLE dynamic_badges 
  ADD COLUMN IF NOT EXISTS category_filter VARCHAR(255);

-- 3. Fix users table
-- Change scoped_categories from ENUM array to TEXT array for dynamic categories
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS scoped_categories_new TEXT[];

-- Copy existing data if any
UPDATE users 
SET scoped_categories_new = ARRAY(SELECT unnest(scoped_categories)::TEXT)
WHERE scoped_categories IS NOT NULL;

-- Drop old column and rename new one
ALTER TABLE users 
  DROP COLUMN IF EXISTS scoped_categories CASCADE;
  
ALTER TABLE users 
  RENAME COLUMN scoped_categories_new TO scoped_categories;

-- 4. Add submitted_by_admin_id to reports table
ALTER TABLE reports 
  ADD COLUMN IF NOT EXISTS submitted_by_admin_id UUID REFERENCES users(id);

-- 5. Ensure sub_categories in dynamic_categories is JSONB array (not object)
-- Already correct in schema, but ensure default is empty array
ALTER TABLE dynamic_categories 
  ALTER COLUMN sub_categories SET DEFAULT '[]'::jsonb;

-- Update existing empty objects to empty arrays
UPDATE dynamic_categories 
SET sub_categories = '[]'::jsonb
WHERE sub_categories = '{}'::jsonb;

-- Print success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 001 completed successfully!';
  RAISE NOTICE 'Updated dynamic_categories: added color_dark, renamed label→name fields';
  RAISE NOTICE 'Updated dynamic_badges: added category_filter';
  RAISE NOTICE 'Updated users: changed scoped_categories to TEXT[]';
  RAISE NOTICE 'Updated reports: added submitted_by_admin_id';
END $$;

-- Make thumbnail nullable for resources
-- Thumbnails can be auto-generated via webhooks or provided manually
ALTER TABLE resource ALTER COLUMN thumbnail DROP NOT NULL;


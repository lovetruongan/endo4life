-- Add preview_image_path column to certificate table for displaying certificate as image
ALTER TABLE certificate
ADD COLUMN preview_image_path VARCHAR(500);

-- Add comment to document the column purpose
COMMENT ON COLUMN certificate.preview_image_path IS 'MinIO object key for certificate preview PNG image (for display on web)';


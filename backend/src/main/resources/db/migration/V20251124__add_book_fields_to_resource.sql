-- Add book-specific fields to resource table
ALTER TABLE resource ADD COLUMN IF NOT EXISTS author VARCHAR(255);
ALTER TABLE resource ADD COLUMN IF NOT EXISTS publisher VARCHAR(255);
ALTER TABLE resource ADD COLUMN IF NOT EXISTS publish_year INTEGER;
ALTER TABLE resource ADD COLUMN IF NOT EXISTS isbn VARCHAR(50);

-- Add comment for documentation
COMMENT ON COLUMN resource.author IS 'Author of the book (for BOOK type resources)';
COMMENT ON COLUMN resource.publisher IS 'Publisher of the book (for BOOK type resources)';
COMMENT ON COLUMN resource.publish_year IS 'Publication year (for BOOK type resources)';
COMMENT ON COLUMN resource.isbn IS 'ISBN number (for BOOK type resources)';


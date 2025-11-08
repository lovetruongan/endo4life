-- Create certificate table
CREATE TABLE IF NOT EXISTS certificate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('PROFESSIONAL', 'COURSE_COMPLETION')),
    file_path VARCHAR(500) NOT NULL,
    issued_at TIMESTAMP,
    expires_at TIMESTAMP,
    user_info_id UUID NOT NULL,
    course_id UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_certificate_user_info FOREIGN KEY (user_info_id) REFERENCES user_info(id) ON DELETE CASCADE,
    CONSTRAINT fk_certificate_course FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_certificate_user_info_id ON certificate(user_info_id);
CREATE INDEX idx_certificate_course_id ON certificate(course_id);
CREATE INDEX idx_certificate_type ON certificate(type);
CREATE INDEX idx_certificate_is_deleted ON certificate(is_deleted);

-- Add course_certificate_id to user_registration_course table
ALTER TABLE user_registration_course 
ADD COLUMN IF NOT EXISTS course_certificate_id UUID,
ADD CONSTRAINT fk_user_registration_course_certificate 
FOREIGN KEY (course_certificate_id) REFERENCES certificate(id) ON DELETE SET NULL;

-- Create index for course_certificate_id
CREATE INDEX idx_user_registration_course_certificate_id ON user_registration_course(course_certificate_id);

-- NOTE: Data migration from user_info.certificate_path to certificate table should be done manually if needed
-- The old certificate_path column in user_info table will remain for backward compatibility
-- but should eventually be deprecated once all data is migrated


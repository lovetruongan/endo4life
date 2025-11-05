-- Create user_test_submission table to store student test submissions and results
CREATE TABLE user_test_submission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES test(id) ON DELETE CASCADE,
    user_info_id UUID NOT NULL REFERENCES user_info(id) ON DELETE CASCADE,
    submitted_answers TEXT,
    score INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    grading_details TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_user_test_submission_test_id ON user_test_submission(test_id);
CREATE INDEX idx_user_test_submission_user_info_id ON user_test_submission(user_info_id);
CREATE INDEX idx_user_test_submission_test_user ON user_test_submission(test_id, user_info_id);
CREATE INDEX idx_user_test_submission_passed ON user_test_submission(passed);

-- Add course_section_id column to test table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'test'
        AND column_name = 'course_section_id'
    ) THEN
        ALTER TABLE test ADD COLUMN course_section_id UUID REFERENCES course_section(id) ON DELETE CASCADE;
        CREATE INDEX idx_test_course_section_id ON test(course_section_id);
    END IF;
END $$;

-- Comment on table and columns
COMMENT ON TABLE user_test_submission IS 'Stores student test submissions with auto-grading results';
COMMENT ON COLUMN user_test_submission.submitted_answers IS 'JSON string of submitted answers';
COMMENT ON COLUMN user_test_submission.score IS 'Score percentage (0-100)';
COMMENT ON COLUMN user_test_submission.grading_details IS 'JSON string with detailed results for each question';
COMMENT ON COLUMN user_test_submission.attempt_number IS 'Sequential attempt number for this user and test';


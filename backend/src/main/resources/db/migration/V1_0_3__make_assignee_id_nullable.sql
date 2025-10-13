-- Make assignee_id nullable for doctor_user_conversations
-- Assignee (doctor) is optional and can be assigned later by admin
ALTER TABLE doctor_user_conversations ALTER COLUMN assignee_id DROP NOT NULL;


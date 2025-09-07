-- Initial schema for Endo4Life platform based on proven e-learning structure

-- Users table (synced with Keycloak)
CREATE TABLE user_info (
    id                     UUID PRIMARY KEY,
    user_id                UUID         NOT NULL,
    username               VARCHAR(255) NOT NULL UNIQUE,
    course_registration_id UUID[],
    first_name             VARCHAR(255),
    last_name              VARCHAR(255),
    email                  VARCHAR(255) NOT NULL UNIQUE,
    phone_number           VARCHAR(255),
    state                  VARCHAR(255),
    is_deleted             BOOLEAN                  DEFAULT FALSE,
    role                   VARCHAR(50)  NOT NULL,
    avatar_path            VARCHAR(255),
    certificate_path       VARCHAR(255),
    is_updated_profile     BOOLEAN                  DEFAULT FALSE,
    disabled_at            TIMESTAMP,

    created_by             VARCHAR(255),
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by             VARCHAR(255),
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Resources (educational content, videos, documents)
CREATE TABLE resource (
    id                    UUID PRIMARY KEY,
    type                  VARCHAR(20),
    path                  VARCHAR(255),
    state                 VARCHAR(255) NOT NULL,
    thumbnail             VARCHAR(255) NOT NULL,
    dimension             VARCHAR(255),
    size                  VARCHAR(255),
    title                 TEXT NOT NULL,
    label_polygon         JSONB,
    view_number           INTEGER,
    description           TEXT,
    comment_count         INTEGER DEFAULT 0,
    time                  INTEGER,
    extension             VARCHAR(255),
    
    -- Tag system for endometriosis content
    tag                   TEXT,
    detail_tag            TEXT,
    anatomy_location_tag  TEXT,
    light_tag             TEXT,
    upper_gastro_anatomy_tag TEXT,
    hp_tag                TEXT,
    
    created_by            VARCHAR(255),
    approved_at           TIMESTAMP,
    approved_by           VARCHAR(255),
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by            VARCHAR(255),
    updated_at            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments on resources and courses
CREATE TABLE comment (
    id                UUID PRIMARY KEY,
    resource_id       UUID,
    course_id         UUID,
    parent_id         UUID,
    content           TEXT NOT NULL,
    user_info_id      UUID NOT NULL,
    attachments       VARCHAR(255)[],

    created_by        VARCHAR(255),
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Courses
CREATE TABLE course (
    id                    UUID PRIMARY KEY,
    state                 VARCHAR(20),
    title                 TEXT,
    description           TEXT,
    lecturer              VARCHAR(120),
    point                 DOUBLE PRECISION,
    rating                DOUBLE PRECISION,
    registration_number   INTEGER,
    view_number           INTEGER,
    thumbnail             VARCHAR(255),
    tags                  TEXT,
    tags_detail           TEXT,
    total_course_section  INTEGER,

    created_by            VARCHAR(255),
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by            VARCHAR(255),
    updated_at            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tests and quizzes (must be created before course_section due to FK)
CREATE TABLE test (
    id                UUID PRIMARY KEY,
    title             TEXT,
    description       TEXT,
    course_id         UUID NOT NULL,
    type              VARCHAR(255),
    state             VARCHAR(255),
    allowed_attempts  INTEGER,
    waiting_time      INTEGER,
    
    CONSTRAINT fk_course_id FOREIGN KEY (course_id) REFERENCES course(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Course sections/chapters
CREATE TABLE course_section (
    id                    UUID PRIMARY KEY,
    course_id             UUID NOT NULL,
    title                 TEXT,
    tags                  TEXT,
    tags_detail           TEXT,
    total_credits         INTEGER,
    thumbnail             VARCHAR(255),
    state                 VARCHAR(255),
    attribute             TEXT,
    video_duration        INTEGER,
    test_id               UUID,
    attachments           VARCHAR(255),

    created_by            VARCHAR(255),
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by            VARCHAR(255),
    updated_at            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_course_id FOREIGN KEY (course_id) REFERENCES course(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_test_id FOREIGN KEY (test_id) REFERENCES test(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT unique_test_id UNIQUE (test_id)
);

-- Questions in tests
CREATE TABLE question (
    id              UUID PRIMARY KEY,
    title           TEXT,
    description     TEXT,
    type            VARCHAR(255),
    test_id         UUID NOT NULL,
    answers         TEXT,
    order_index     INTEGER,
    
    CONSTRAINT fk_test_id FOREIGN KEY (test_id) REFERENCES test(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Question attachments (images, etc.)
CREATE TABLE question_attachment (
    id              UUID PRIMARY KEY,
    question_id     UUID NOT NULL,
    object_key      UUID NOT NULL,
    bucket          VARCHAR(255),
    width           INTEGER,
    height          INTEGER,
    file_name       VARCHAR(255),
    file_type       VARCHAR(255),
    file_size       INTEGER,

    created_by      VARCHAR(255),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by      VARCHAR(255),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_question_id FOREIGN KEY (question_id) REFERENCES question(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- User course registrations
CREATE TABLE user_registration_course (
    id                                  UUID PRIMARY KEY,
    user_info_id                        UUID NOT NULL,
    course_id                           UUID NOT NULL,
    number_lectures_completed           INTEGER DEFAULT 0,
    total_lectures                      INTEGER,
    is_completed_entrance_test          BOOLEAN DEFAULT FALSE,
    is_completed_survey_course          BOOLEAN DEFAULT FALSE,
    is_completed_total_course_section   BOOLEAN DEFAULT FALSE,
    is_completed_final_course_test      BOOLEAN DEFAULT FALSE,
    is_completed_course                 BOOLEAN DEFAULT FALSE,
    
    created_by                          VARCHAR(255),
    created_at                          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by                          VARCHAR(255),
    updated_at                          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_info_id FOREIGN KEY (user_info_id) REFERENCES user_info(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_course_id FOREIGN KEY (course_id) REFERENCES course(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT unique_user_info_id_course_id UNIQUE (user_info_id, course_id)
);

-- User progress in course sections
CREATE TABLE user_progress_course_section (
    id                                      UUID PRIMARY KEY,
    user_registration_course_id             UUID NOT NULL,
    course_section_id                       UUID NOT NULL,
    total_second_watched_lecture_video      INTEGER,
    total_second_lecture_video              INTEGER,
    percentage_video_watched                DECIMAL(5, 2),
    is_completed_video_course_section       BOOLEAN DEFAULT FALSE,
    is_completed_lecture_review_question    BOOLEAN DEFAULT FALSE,
    is_completed_course_section             BOOLEAN DEFAULT FALSE,

    created_by                              VARCHAR(255),
    created_at                              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by                              VARCHAR(255),
    updated_at                              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_registration_course_id FOREIGN KEY (user_registration_course_id) 
        REFERENCES user_registration_course(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_course_section_id FOREIGN KEY (course_section_id) 
        REFERENCES course_section(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT unique_user_registration_course_id_course_section_id 
        UNIQUE (user_registration_course_id, course_section_id)
);

-- User test attempts
CREATE TABLE user_answer_test (
    id                                      UUID PRIMARY KEY,
    type                                    VARCHAR(255) NOT NULL,
    user_registration_course_id             UUID NOT NULL,
    user_progress_course_section_id         UUID,
    user_info_id                            UUID NOT NULL,
    test_id                                 UUID NOT NULL,
    total_correct_multiple_choice_questions INTEGER DEFAULT 0,
    total_multiple_choice_questions         INTEGER,
    percentage_correct_multiple_choice      DECIMAL(5, 2),
    attempted_times                         INTEGER DEFAULT 0,
    is_passed_test                          BOOLEAN DEFAULT FALSE,

    created_by                              VARCHAR(255),
    created_at                              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by                              VARCHAR(255),
    updated_at                              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_registration_course_id FOREIGN KEY (user_registration_course_id) 
        REFERENCES user_registration_course(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_progress_course_section_id FOREIGN KEY (user_progress_course_section_id) 
        REFERENCES user_progress_course_section(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_info_id FOREIGN KEY (user_info_id) 
        REFERENCES user_info(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_test_id FOREIGN KEY (test_id) 
        REFERENCES test(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- User answers to specific questions
CREATE TABLE user_answer_question (
    id                                      UUID PRIMARY KEY,
    user_answer_test_id                     UUID NOT NULL,
    question_id                             UUID NOT NULL,
    user_answered_question                  TEXT,
    is_passed_question                      BOOLEAN DEFAULT FALSE,

    created_by                              VARCHAR(255),
    created_at                              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by                              VARCHAR(255),
    updated_at                              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_answer_test_id FOREIGN KEY (user_answer_test_id) 
        REFERENCES user_answer_test(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_question_id FOREIGN KEY (question_id) 
        REFERENCES question(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- User resource interactions (bookmarks, likes, etc.)
CREATE TABLE user_resource (
    id              UUID PRIMARY KEY,
    type            VARCHAR(255),
    user_info_id    UUID NOT NULL,
    resource_id     UUID NOT NULL,

    created_by      VARCHAR(255),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by      VARCHAR(255),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_info_id FOREIGN KEY (user_info_id) 
        REFERENCES user_info(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_resource_id FOREIGN KEY (resource_id) 
        REFERENCES resource(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Doctor-patient conversations/consultations
CREATE TABLE doctor_user_conversations (
    id              UUID PRIMARY KEY,
    state           VARCHAR(255),
    type            VARCHAR(255),
    resource_id     UUID NOT NULL,
    questioner_id   UUID NOT NULL,
    assignee_id     UUID,
    content         TEXT,
    attachments     VARCHAR(255),
    parent_id       UUID,

    created_by      VARCHAR(255),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by      VARCHAR(255),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_resource_id FOREIGN KEY (resource_id) 
        REFERENCES resource(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_questioner_id FOREIGN KEY (questioner_id) 
        REFERENCES user_info(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_assignee_id FOREIGN KEY (assignee_id) 
        REFERENCES user_info(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_parent_id FOREIGN KEY (parent_id) 
        REFERENCES doctor_user_conversations(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tag system for categorization
CREATE TABLE tag (
    id         UUID PRIMARY KEY,
    parent_id  UUID,
    content    VARCHAR(255) NOT NULL,
    type       VARCHAR(255),

    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_user_info_username ON user_info(username);
CREATE INDEX idx_user_info_email ON user_info(email);
CREATE INDEX idx_user_info_state ON user_info(state);

CREATE INDEX idx_resource_state ON resource(state);
CREATE INDEX idx_resource_type ON resource(type);

CREATE INDEX idx_course_state ON course(state);

CREATE INDEX idx_course_section_course_id ON course_section(course_id);

CREATE INDEX idx_question_test_id ON question(test_id);
CREATE INDEX idx_question_attachment_question_id ON question_attachment(question_id);

CREATE INDEX idx_user_registration_course_course_id ON user_registration_course(course_id);
CREATE INDEX idx_user_progress_course_section_user_registration_course_id 
    ON user_progress_course_section(user_registration_course_id);
CREATE INDEX idx_user_progress_course_section_user_registration_course_id_course_section_id 
    ON user_progress_course_section(user_registration_course_id, course_section_id);

CREATE INDEX idx_user_answer_test_user_registration_course_id ON user_answer_test(user_registration_course_id);
CREATE INDEX idx_user_answer_test_user_progress_course_section_id ON user_answer_test(user_progress_course_section_id);
CREATE INDEX idx_user_answer_question_user_answer_test_id ON user_answer_question(user_answer_test_id);

CREATE INDEX idx_user_resource_user_id_type ON user_resource(user_info_id, type);
CREATE INDEX idx_doctor_user_conversations_type_questioner_id_assignee_id 
    ON doctor_user_conversations(type, questioner_id, assignee_id);

CREATE INDEX idx_tag_content ON tag(content);

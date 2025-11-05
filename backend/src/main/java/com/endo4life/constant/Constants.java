package com.endo4life.constant;

import lombok.experimental.UtilityClass;

import java.util.List;
import java.util.Map;

@UtilityClass
public class Constants {
        /* Characters */
        public final String SYSTEM = "SYSTEM";
        public final String BEARER = "Bearer ";
        public final String REASON = "Reason";
        public final String INVALID_SESSION = "Invalid-session";
        public final String IMAGE_PROFILE = "Image-profile";
        public final String PERCENT = "%";
        public final String UNDERSCORE = "_";
        public final String COLON = ":";
        public final String SLASH = "/";
        public final String DOT = ".";
        public final String COMMA = ",";
        public final String LINE_BREAK = "\n";

        /* Keycloak */
        public final String KEYCLOAK_UPDATE_PROFILE = "UPDATE_PROFILE";
        public final List<String> KEYCLOAK_HANDLING_EVENT = List.of(KEYCLOAK_UPDATE_PROFILE);
        public final String KEYCLOAK_RESOURCE_TYPE_USER = "USER";
        public final String UPDATE = "UPDATE";
        public final String CREATE = "CREATE";
        public final String DELETE = "DELETE";
        public final List<String> KEYCLOAK_HANDLING_OPERATION = List.of(UPDATE);

        /* Time conversion */
        public final int S_TO_MILLIS = 1000;
        public final int MINUTES_TO_MILLIS = 60 * S_TO_MILLIS;
        public final int HOURS_TO_MILLIS = 60 * MINUTES_TO_MILLIS;
        public final int DAYS_TO_MILLIS = 24 * HOURS_TO_MILLIS;

        /* Patterns */
        public final String PHONE_NUMBER_PATTERN = "(\\+)?\\d+";
        public final String EMAIL_PATTERN = "^[A-Za-z0-9+_.-]+@(.+)$";
        public final String PASSWORD_PATTERN = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[^A-Za-z\\d])[A-Za-z\\d@$!~%+=*`?_&\\-\\/#^&*()]{8,}$";

        /* Units */
        public final String UNIT_GB = "GB";
        public final String UNIT_MB = "MB";
        public final String UNIT_KB = "KB";

        /* MinIO */
        public final String queueArnWebhook = "arn:minio:sqs::%s:webhook";
        public final int DEFAULT_PRESIGNED_EXPIRY = 10 * MINUTES_TO_MILLIS;
        public final Map<String, String> MinioBucketOperations = Map.of(
                        "List", "s3:ListBucket",
                        "Create", "s3:CreateBucket",
                        "Delete", "s3:DeleteBucket",
                        "Get", "s3:GetBucketLocation");
        public final Map<String, String> MinioObjectOperations = Map.of(
                        "Get", "s3:GetObject",
                        "Put", "s3:PutObject",
                        "Delete", "s3:DeleteObject");
        public final Map<String, String> MinioEventOperations = Map.of(
                        "Get", "s3:ObjectAccessed:*",
                        "Create", "s3:ObjectCreated:*",
                        "Delete", "s3:ObjectRemoved:*");
        public final String DIVIDED_MULTIPART_FILE_PATTERN = ".part\\d+$";

        /* Resource */
        public final List<String> VIDEO_EXTENSIONS = List.of("mp4", "m4p", "m4v", "mkv", "avi", "mov", "wmv", "flv");
        public final List<String> IMAGE_EXTENSIONS = List.of("png", "jpg", "jpeg", "gif", "svg");
        public final List<String> COMPRESSED_EXTENSIONS = List.of("zip", "rar");
        public final String THUMBNAIL_DIMENSION = "1280x720";
        public final String SMALL_THUMBNAIL_DIMENSION = "336x188";
        public final String THUMBNAIL_CONTENT_TYPE = "image/png";
        public final String THUMBNAIL_EXTENSION = "png";
        public final String TEMPLATE_THUMBNAIL_NAME = "thumbnail_";
        public final String TEMPLATE_SMALL_THUMBNAIL_NAME = "small_thumbnail_";
        public final String IMAGE_RESOURCE_TYPE = "IMAGE";
        public final String VIDEO_RESOURCE_TYPE = "VIDEO";
        public final String AVATAR_RESOURCE_TYPE = "AVATAR";
        public final String THUMBNAIL_RESOURCE_TYPE = "THUMBNAIL";
        public final String OTHER_RESOURCE_TYPE = "OTHER";
        public final String PROCESS_RESOURCE_TYPE = "PROCESS";

        /* Course */
        public final Integer INITIALIZE_VIEW_COUNT = 1;
        public final Integer ONE = 1;
        public final String LECTURE_REVIEW_QUESTIONS_COURSE = "LECTURE_REVIEW_QUESTIONS_COURSE";
        public final String ENTRANCE_TEST_COURSE = "ENTRANCE_TEST_COURSE";
        public final String FINAL_EXAM_COURSE = "FINAL_EXAM_COURSE";
        public final String SURVEY_COURSE = "SURVEY_COURSE";
        public final String PUBLIC_STATE = "PUBLIC";

        /* Error */
        public final String ERROR = "error";
        public static final String MESSAGE = "message";
        public final String PATH = "path";

        /* percentage */
        public static final float ONE_HUNDRED = 100.0f;
        public static final float COMPLETION_THRESHOLD = 30.0f;
        // When course section video duration is unknown, consider video completed after N seconds watched
        public static final int MIN_WATCH_SECONDS_TO_COMPLETE_FALLBACK = 5;

        /* test */
        public static final Integer ONE_HUNDRED_INTEGER = 100;
        public static final Double THRESHOLD_PASS_TEST = 80.0;
        public static final Integer ZERO_INTEGER = 0;
        public static final Long ZERO_LONG = 0L;
        public static final Double ZERO_DOUBLE = 0D;
        public static final String SINGLE_SELECT = "SINGLE_SELECT";
        public static final String MULTIPLE_SELECT = "MULTIPLE_SELECT";
}

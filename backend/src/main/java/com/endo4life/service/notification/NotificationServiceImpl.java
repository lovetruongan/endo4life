package com.endo4life.service.notification;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public static final String TYPE_QUESTION_ASSIGNED = "QUESTION_ASSIGNED";
    public static final String TYPE_QUESTION_REPLIED = "QUESTION_REPLIED";
    public static final String TYPE_QUESTION_RESOLVED = "QUESTION_RESOLVED";
    public static final String TYPE_COMMENT_REPLY = "COMMENT_REPLY";

    @Override
    public void notifyUploadProgress(String fileName, int progress) {
        String destination = "/topic/upload-progress/" + fileName;
        Map<String, Object> progressUpdate = Map.of(
                "fileName", fileName,
                "progress", progress);
        log.info("Sending progress upload to {}", destination);
        try {
            messagingTemplate.convertAndSend(destination, progressUpdate);
        } catch (Exception e) {
            log.error("Failed to send progress update: {}", e.getMessage());
        }
    }

    @Override
    public void notifyUploadProgress(String sessionId, int processed, int total, String message) {
        String destination = "/topic/zip-upload-progress/" + sessionId;
        Map<String, Object> progressUpdate = Map.of(
                "sessionId", sessionId,
                "processed", processed,
                "total", total,
                "message", message,
                "progress", total > 0 ? (processed * 100 / total) : 0);
        log.info("Sending ZIP progress to {}: {}/{}", destination, processed, total);
        try {
            messagingTemplate.convertAndSend(destination, progressUpdate);
        } catch (Exception e) {
            log.error("Failed to send ZIP progress update: {}", e.getMessage());
        }
    }

    @Override
    public void notifyUploadSuccess(String fileName) {
        try {
            messagingTemplate.convertAndSend("/topic/upload-status",
                    "Upload successful: " + fileName);
        } catch (Exception e) {
            log.error("Failed to send upload success notification: {}", e.getMessage());
        }
    }
    
    @Override
    public void notifyUploadSuccess(String sessionId, String message) {
        String destination = "/topic/zip-upload-progress/" + sessionId;
        Map<String, Object> successUpdate = Map.of(
                "sessionId", sessionId,
                "status", "SUCCESS",
                "message", message);
        log.info("Sending ZIP success to {}: {}", destination, message);
        try {
            messagingTemplate.convertAndSend(destination, successUpdate);
        } catch (Exception e) {
            log.error("Failed to send ZIP success notification: {}", e.getMessage());
        }
    }

    @Override
    public void notifyUploadFailure(String fileName, String errorMessage) {
        try {
            messagingTemplate.convertAndSend("/topic/upload-status",
                    "Upload failed: " + fileName + ", Error: " + errorMessage);
        } catch (Exception e) {
            log.error("Failed to send upload failure notification: {}", e.getMessage());
        }
    }
    
    @Override
    public void notifyZipUploadFailure(String sessionId, String errorMessage) {
        String destination = "/topic/zip-upload-progress/" + sessionId;
        Map<String, Object> failureUpdate = Map.of(
                "sessionId", sessionId,
                "status", "FAILED",
                "message", errorMessage);
        log.error("Sending ZIP failure to {}: {}", destination, errorMessage);
        try {
            messagingTemplate.convertAndSend(destination, failureUpdate);
        } catch (Exception e) {
            log.error("Failed to send ZIP failure notification: {}", e.getMessage());
        }
    }

    @Override
    public void notifyUser(UUID userId, String type, String title, String content, String link) {
        String destination = "/topic/notifications/" + userId.toString();
        Map<String, Object> notification = Map.of(
                "id", UUID.randomUUID().toString(),
                "type", type,
                "title", title,
                "content", content,
                "link", link,
                "createdAt", LocalDateTime.now().toString(),
                "isUnread", true);
        log.info("Sending notification to user {}: {}", userId, title);
        try {
            messagingTemplate.convertAndSend(destination, notification);
        } catch (Exception e) {
            log.error("Failed to send notification to user {}: {}", userId, e.getMessage());
        }
    }

    @Override
    public void notifyNewQuestionAssigned(UUID specialistId, UUID conversationId, String questionContent) {
        String truncatedContent = questionContent.length() > 100 
                ? questionContent.substring(0, 100) + "..." 
                : questionContent;
        notifyUser(
                specialistId,
                TYPE_QUESTION_ASSIGNED,
                "Câu hỏi mới được phân công",
                truncatedContent,
                "/my-questions"
        );
    }

    @Override
    public void notifyQuestionReplied(UUID userId, UUID conversationId, String replyContent) {
        String truncatedContent = replyContent.length() > 100 
                ? replyContent.substring(0, 100) + "..." 
                : replyContent;
        notifyUser(
                userId,
                TYPE_QUESTION_REPLIED,
                "Có phản hồi mới cho câu hỏi của bạn",
                truncatedContent,
                "/my-questions"
        );
    }

    @Override
    public void notifyQuestionResolved(UUID userId, UUID conversationId) {
        notifyUser(
                userId,
                TYPE_QUESTION_RESOLVED,
                "Câu hỏi đã được giải quyết",
                "Câu hỏi của bạn đã được đánh dấu là đã giải quyết",
                "/my-questions"
        );
    }

    @Override
    public void notifyCommentReply(UUID userId, UUID commentId, String replyContent, UUID resourceId) {
        String truncatedContent = replyContent.length() > 100 
                ? replyContent.substring(0, 100) + "..." 
                : replyContent;
        notifyUser(
                userId,
                TYPE_COMMENT_REPLY,
                "Có phản hồi mới cho bình luận của bạn",
                truncatedContent,
                "/resources/videos/" + resourceId.toString()
        );
    }
}

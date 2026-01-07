package com.endo4life.service.notification;

import java.util.UUID;

public interface NotificationService {
    // Upload progress notifications
    void notifyUploadProgress(String fileName, int progress);

    void notifyUploadProgress(String sessionId, int processed, int total, String message);

    void notifyUploadSuccess(String fileName);

    void notifyUploadSuccess(String sessionId, String message);

    void notifyUploadFailure(String fileName, String errorMessage);

    void notifyZipUploadFailure(String sessionId, String errorMessage);

    // User notifications (real-time)
    void notifyUser(UUID userId, String type, String title, String content, String link);

    void notifyNewQuestionAssigned(UUID specialistId, UUID conversationId, String questionContent);

    void notifyQuestionReplied(UUID userId, UUID conversationId, String replyContent);

    void notifyQuestionResolved(UUID userId, UUID conversationId);

    void notifyCommentReply(UUID userId, UUID commentId, String replyContent, UUID resourceId);
}

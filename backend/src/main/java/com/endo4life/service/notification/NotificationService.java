package com.endo4life.service.notification;

public interface NotificationService {
    void notifyUploadProgress(String fileName, int progress);

    void notifyUploadProgress(String sessionId, int processed, int total, String message);

    void notifyUploadSuccess(String fileName);

    void notifyUploadSuccess(String sessionId, String message);

    void notifyUploadFailure(String fileName, String errorMessage);

    void notifyZipUploadFailure(String sessionId, String errorMessage);
}

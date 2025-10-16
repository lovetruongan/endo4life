package com.endo4life.service.notification;

public interface NotificationService {
    void notifyUploadProgress(String fileName, int progress);

    void notifyUploadSuccess(String fileName);

    void notifyUploadFailure(String fileName, String errorMessage);
}

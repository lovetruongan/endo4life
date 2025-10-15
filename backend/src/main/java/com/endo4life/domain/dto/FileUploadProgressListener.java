package com.endo4life.domain.dto;

import lombok.AllArgsConstructor;
import com.endo4life.service.notification.NotificationService;

@AllArgsConstructor
public class FileUploadProgressListener {
    private final String fileName;
    private final long totalBytes;
    private long bytesUploaded;
    private final NotificationService notificationService;

    public FileUploadProgressListener(String fileName, long totalBytes,
            NotificationService notificationService) {
        this.fileName = fileName;
        this.totalBytes = totalBytes;
        this.notificationService = notificationService;
        this.bytesUploaded = 0;
    }

    public void updateProgress(long bytes) {
        this.bytesUploaded += bytes;
        int progress = (int) ((bytesUploaded * 100) / totalBytes);

        notificationService.notifyUploadProgress(fileName, progress);
    }
}

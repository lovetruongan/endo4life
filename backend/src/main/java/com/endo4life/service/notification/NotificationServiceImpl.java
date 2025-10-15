package com.endo4life.service.notification;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

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
    public void notifyUploadSuccess(String fileName) {
        try {
            messagingTemplate.convertAndSend("/topic/upload-status",
                    "Upload successful: " + fileName);
        } catch (Exception e) {
            log.error("Failed to send upload success notification: {}", e.getMessage());
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
}

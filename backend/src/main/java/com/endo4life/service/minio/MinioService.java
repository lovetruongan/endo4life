package com.endo4life.service.minio;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MinioService {
    String uploadFile(String bucketName, MultipartFile file) throws Exception;
    byte[] downloadFile(String bucketName, String objectName) throws Exception;
    String updateFile(String bucketName, String objectName, MultipartFile newFile) throws Exception;
    void deleteFile(String bucketName, String objectName) throws Exception;
    List<String> listFiles(String bucketName) throws Exception;
    String getPresignedUrl(String bucketName, String objectName, Integer expirySeconds) throws Exception;
}
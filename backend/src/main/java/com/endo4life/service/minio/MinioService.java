package com.endo4life.service.minio;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;

public interface MinioService {

    // Upload file với tên gốc
    String uploadFile(MultipartFile file, String bucket);

    // Upload file với tên chỉ định
    String uploadFile(MultipartFile file, String bucket, String fileName);

    // Lấy file (stream)
    InputStream getFile(String bucket, String objectName);

    // Xoá file - fileName first for consistency
    void removeFile(String fileName, String bucket);

    // Xoá nhiều file
    void removeFiles(List<String> fileNames, String bucket);

    // Update (thực chất là xoá rồi upload lại)
    String updateFile(String fileName, MultipartFile file, String bucket, String newFileName);

    // Tạo pre-signed URL để tải file (GET) - resourcePath first
    String createGetPreSignedLink(String resourcePath, String bucket);

    // Tạo pre-signed URL để upload file (PUT)
    String createPutPreSignedLink(String resourcePath, String bucket);

    // Upload file in chunks (for large files)
    String uploadChunk(MultipartFile file, String bucketName, String fileName);

    // Generate multiple pre-signed URLs for bulk upload
    List<String> generatePreSignedUrls(com.endo4life.web.rest.model.GeneratePreSignedUrlDto dto);

    // Get pre-signed link based on resource type
    String getPreSignedLinkMethodGetWithResourceType(String objectKey, String resourceType);

    // Get bucket name from resource type
    String getBucketFromResourceType(String resourceType);
}

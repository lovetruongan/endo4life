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

    // Xoá file
    void removeFile(String bucket, String objectName);

    // Xoá nhiều file
    void removeFiles(String bucket, List<String> objectNames);

    // Update (thực chất là xoá rồi upload lại)
    String updateFile(String bucket, String oldObjectName, MultipartFile file, String newObjectName);

    // Tạo pre-signed URL để tải file (GET)
    String createGetPreSignedLink(String bucket, String objectName);

    // Tạo pre-signed URL để upload file (PUT)
    String createPutPreSignedLink(String bucket, String objectName);
}

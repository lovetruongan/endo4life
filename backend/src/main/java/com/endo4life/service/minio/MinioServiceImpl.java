package com.endo4life.service.minio;

import io.minio.*;
import io.minio.http.Method;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class MinioServiceImpl implements MinioService {

    private final MinioClient minioClient;
    private final MinioProperties properties;

    public MinioServiceImpl(MinioProperties properties) {
        this.properties = properties;
        this.minioClient = MinioClient.builder()
                .endpoint(properties.getEndpoint())
                .credentials(properties.getUsername(), properties.getPassword())
                .build();
    }

    private void createBucketIfNotExists(String bucket) throws Exception {
        boolean found = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucket).build());
        if (!found) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            log.info("Bucket {} created", bucket);
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String bucket) {
        try {
            String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
            return uploadFile(file, bucket, fileName);
        } catch (Exception e) {
            log.error("Upload file failed: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String bucket, String fileName) {
        try (InputStream inputStream = file.getInputStream()) {
            createBucketIfNotExists(bucket);
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(fileName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build());
            return fileName;
        } catch (Exception e) {
            log.error("Upload file with name failed: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public InputStream getFile(String bucket, String objectName) {
        try {
            if (StringUtils.isEmpty(bucket) || StringUtils.isEmpty(objectName)) {
                throw new IllegalArgumentException("Bucket or objectName is empty");
            }
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .build());
        } catch (Exception e) {
            log.error("Get file failed: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public void removeFile(String bucket, String objectName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .build());
        } catch (Exception e) {
            log.error("Remove file failed: {}", e.getMessage(), e);
        }
    }

    @Override
    public void removeFiles(String bucket, List<String> objectNames) {
        try {
            List<io.minio.messages.DeleteObject> deleteObjects = new ArrayList<>();
            for (String obj : objectNames) {
                deleteObjects.add(new io.minio.messages.DeleteObject(obj));
            }

            minioClient.removeObjects(
                    RemoveObjectsArgs.builder()
                            .bucket(bucket)
                            .objects(deleteObjects)
                            .build());
        } catch (Exception e) {
            log.error("Remove multiple files failed: {}", e.getMessage(), e);
        }
    }

    @Override
    public String updateFile(String bucket, String oldObjectName, MultipartFile file, String newObjectName) {
        try {
            // Xoá file cũ
            removeFile(bucket, oldObjectName);
            // Upload file mới
            return uploadFile(file, bucket, newObjectName);
        } catch (Exception e) {
            log.error("Update file failed: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public String createGetPreSignedLink(String resourcePath, String bucket) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucket)
                            .object(resourcePath)
                            .expiry(1, TimeUnit.HOURS) // Link hết hạn sau 1 giờ
                            .build());
        } catch (Exception e) {
            log.error("Create GET presigned link failed: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public String createPutPreSignedLink(String resourcePath, String bucket) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.PUT)
                            .bucket(bucket)
                            .object(resourcePath)
                            .expiry(1, TimeUnit.HOURS) // Link hết hạn sau 1 giờ
                            .build());
        } catch (Exception e) {
            log.error("Create PUT presigned link failed: {}", e.getMessage(), e);
            return null;
        }
    }
}

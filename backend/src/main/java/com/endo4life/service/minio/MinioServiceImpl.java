package com.endo4life.service.minio;

import io.minio.*;
import io.minio.errors.*;
import io.minio.http.Method;
import io.minio.messages.Item;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class MinioServiceImpl implements MinioService {

    private final MinioClient minioClient;
    private final MinioProperties minioProperties;

    public MinioServiceImpl(MinioProperties minioProperties) {
        this.minioProperties = minioProperties;
        this.minioClient = MinioClient.builder()
                .endpoint(minioProperties.getEndpoint())
                .credentials(minioProperties.getUsername(), minioProperties.getPassword())
                .build();
    }

    @Override
    public String uploadFile(String bucketName, MultipartFile file) throws Exception {
        checkBucket(bucketName);

        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(file.getOriginalFilename())
                        .stream(file.getInputStream(), file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build());

        return file.getOriginalFilename();
    }

    @Override
    public byte[] downloadFile(String bucketName, String objectName) throws Exception {
        checkBucket(bucketName);

        try (InputStream stream = minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .build())) {
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int bytesRead;
            while ((bytesRead = stream.read(buf)) != -1) {
                os.write(buf, 0, bytesRead);
            }
            return os.toByteArray();
        }
    }

    @Override
    public String updateFile(String bucketName, String objectName, MultipartFile newFile) throws Exception {
        deleteFile(bucketName, objectName);
        return uploadFile(bucketName, newFile);
    }

    @Override
    public void deleteFile(String bucketName, String objectName) throws Exception {
        checkBucket(bucketName);

        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .build());
    }

    @Override

    public String getPresignedUrl(String bucketName, String objectName, Integer expirySeconds) throws Exception {
        checkBucket(bucketName);

        return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(bucketName)
                        .object(objectName)
                        .expiry(expirySeconds)
                        .build());
    }

    private void checkBucket(String bucketName) throws Exception {
        boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
        if (!found) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        }
    }

    @Override
    public List<String> listFiles(String bucketName) throws Exception {
        checkBucket(bucketName);
        Iterable<Result<Item>> results = minioClient.listObjects(
                ListObjectsArgs.builder().bucket(bucketName).build());

        List<String> fileNames = new ArrayList<>();
        for (Result<Item> result : results) {
            fileNames.add(result.get().objectName());
        }
        return fileNames;

    }
}

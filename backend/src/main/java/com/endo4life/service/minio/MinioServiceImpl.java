package com.endo4life.service.minio;

import com.endo4life.constant.Constants;
import io.minio.*;
import io.minio.http.Method;
import io.minio.messages.DeleteError;
import io.minio.messages.DeleteObject;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioServiceImpl implements MinioService {

    private final MinioClient minioClient;
    private final MinioProperties properties;

    @Override
    @SneakyThrows
    public String uploadFile(MultipartFile file, String bucket) {
        if (Objects.isNull(file.getOriginalFilename())) {
            throw new IllegalArgumentException("Invalid file");
        }
        String fileName = UUID.randomUUID() + Constants.DOT + getFileExtension(file.getOriginalFilename());
        return uploadFile(file, bucket, fileName);
    }

    @Override
    @SneakyThrows
    public String uploadFile(MultipartFile file, String bucket, String fileName) {
        InputStream inputStream = file.getInputStream();

        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucket)
                        .object(fileName)
                        .stream(inputStream, file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build());

        return fileName;
    }

    @SneakyThrows
    @Override
    public InputStream getFile(String bucket, String objectName) {
        if (StringUtils.isEmpty(bucket) || StringUtils.isEmpty(objectName)) {
            log.error("Invalid bucket or key");
            return null;
        }
        return minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucket)
                        .object(objectName)
                        .build());
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    @Override
    @SneakyThrows
    public void removeFile(String fileName, String bucket) {
        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(bucket)
                        .object(fileName)
                        .build());
    }

    @SneakyThrows
    @Override
    public void removeFiles(List<String> fileNames, String bucket) {
        Iterable<Result<DeleteError>> results = minioClient.removeObjects(
                RemoveObjectsArgs.builder()
                        .bucket(bucket)
                        .objects(fileNames.stream().map(DeleteObject::new).toList())
                        .build());

        for (Result<DeleteError> result : results) {
            try {
                DeleteError error = result.get();
                log.error("Failed to delete file: {} from bucket: {} due to error: {}",
                        error.objectName(), bucket, error.message());
            } catch (Exception e) {
                log.error("Error while processing delete results: {}", e.getMessage(), e);
            }
        }
    }

    @Override
    public String updateFile(String fileName, MultipartFile file, String bucket, String newFileName) {
        removeFile(fileName, bucket);
        return uploadFile(file, bucket, newFileName);
    }

    @Override
    public String createGetPreSignedLink(String resourcePath, String bucket) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucket)
                            .object(resourcePath)
                            .expiry(Constants.DEFAULT_PRESIGNED_EXPIRY, TimeUnit.MILLISECONDS)
                            .build());
        } catch (Exception e) {
            log.error("Failed to create presigned link", e);
            return StringUtils.EMPTY;
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
                            .expiry(Constants.DEFAULT_PRESIGNED_EXPIRY, TimeUnit.MILLISECONDS)
                            .build());
        } catch (Exception e) {
            log.error("Failed to create presigned link", e);
            return StringUtils.EMPTY;
        }
    }

    public String uploadChunk(MultipartFile file, String bucketName, String fileName) {
        List<String> partObjectNames = new ArrayList<>();
        int partNumber = 1;
        int bufferSize = 10 * 1024 * 1024; // 10MB buffer
        byte[] buffer = new byte[bufferSize];

        try (InputStream inputStream = file.getInputStream()) {
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer, 0, buffer.length)) != -1) {
                String partObjectName = fileName + ".part" + partNumber;

                if (partNumber % 5 == 0 || partNumber == 1) {
                    log.info("Begin uploading part {}", partObjectName);
                }

                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(partObjectName)
                                .stream(new ByteArrayInputStream(buffer, 0, bytesRead), bytesRead, -1)
                                .build());

                partObjectNames.add(partObjectName);

                if (partNumber % 5 == 0 || partNumber == 1) {
                    log.info("Process part {} complete", partObjectName);
                }
                partNumber++;
            }

            composeObject(bucketName, fileName, partObjectNames);
            return fileName;
        } catch (Exception e) {
            log.error("Error uploading file {}: {}", fileName, e.getMessage(), e);
            return null;
        }
    }

    @SneakyThrows
    private void composeObject(String bucketName, String objectName, List<String> partObjectNames) {
        List<ComposeSource> sources = new ArrayList<>();

        for (String partObjectName : partObjectNames) {
            sources.add(ComposeSource.builder()
                    .bucket(bucketName)
                    .object(partObjectName)
                    .build());
        }

        minioClient.composeObject(
                ComposeObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .sources(sources)
                        .build());

        for (String partObjectName : partObjectNames) {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(partObjectName)
                            .build());
        }
    }

    @Override
    public List<String> generatePreSignedUrls(com.endo4life.web.rest.model.GeneratePreSignedUrlDto dto) {
        com.endo4life.web.rest.model.ResourceType resourceType = dto.getResourceType();
        Integer numberOfUrls = dto.getNumberOfUrls();

        if (numberOfUrls <= 0) {
            return new ArrayList<>();
        }

        String bucket = getBucketFromResourceType(resourceType.getValue());
        if (bucket == null) {
            return new ArrayList<>();
        }

        List<String> presignedUrls = new ArrayList<>();
        for (int i = 0; i < numberOfUrls; i++) {
            String objectKey = UUID.randomUUID().toString();
            presignedUrls.add(createPutPreSignedLink(objectKey, bucket));
        }
        return presignedUrls;
    }

    public String getPreSignedLinkMethodGetWithResourceType(String objectKey, String resourceType) {
        if (StringUtils.equalsIgnoreCase(resourceType, Constants.IMAGE_RESOURCE_TYPE)) {
            return createGetPreSignedLink(objectKey, properties.getBucketImage());
        }
        if (StringUtils.equalsIgnoreCase(resourceType, Constants.VIDEO_RESOURCE_TYPE)) {
            return createGetPreSignedLink(objectKey, properties.getBucketVideo());
        }
        if (StringUtils.equalsIgnoreCase(resourceType, Constants.THUMBNAIL_RESOURCE_TYPE)) {
            return createGetPreSignedLink(objectKey, properties.getBucketThumbnail());
        }
        if (StringUtils.equalsIgnoreCase(resourceType, Constants.OTHER_RESOURCE_TYPE)) {
            return createGetPreSignedLink(objectKey, properties.getBucketOther());
        }
        return null;
    }

    @Override
    public String getBucketFromResourceType(String resourceType) {
        if (StringUtils.equalsIgnoreCase(resourceType, "IMAGE")) {
            return properties.getBucketImage();
        }
        if (StringUtils.equalsIgnoreCase(resourceType, "VIDEO")) {
            return properties.getBucketVideo();
        }
        if (StringUtils.equalsIgnoreCase(resourceType, "THUMBNAIL")) {
            return properties.getBucketThumbnail();
        }
        if (StringUtils.equalsIgnoreCase(resourceType, "AVATAR")) {
            return properties.getBucketAvatar();
        }
        if (StringUtils.equalsIgnoreCase(resourceType, "OTHER")) {
            return properties.getBucketOther();
        }
        return null;
    }
}

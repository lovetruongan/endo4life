package com.endo4life.service.resource;

import com.endo4life.domain.dto.ExtractedFile;
import com.endo4life.service.file.FileService;
import com.endo4life.service.minio.MinioService;
import com.endo4life.service.notification.NotificationService;
import com.endo4life.service.tag.TagService;
import com.endo4life.utils.FileUtil;
import com.endo4life.utils.ResourceUtil;
import com.endo4life.web.rest.model.CreateResourceRequest;
import com.endo4life.web.rest.model.CreateResourceRequestDto;
import com.endo4life.web.rest.model.ResourceCriteria;
import com.endo4life.web.rest.model.ResourceDetailResponseDto;
import com.endo4life.web.rest.model.ResourceResponseDto;
import com.endo4life.web.rest.model.UpdateResourceRequestDto;
import com.endo4life.web.rest.model.UploadType;
import jakarta.annotation.PostConstruct;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import com.endo4life.config.ApplicationProperties;
import com.endo4life.constant.Constants;
import com.endo4life.domain.document.Resource;
import com.endo4life.mapper.ResourceMapper;
import com.endo4life.repository.ResourceRepository;
import com.endo4life.repository.specifications.ResourceSpecifications;
import com.endo4life.security.UserContextHolder;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.endo4life.domain.document.Resource.ResourceType;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final ResourceMapper resourceMapper;
    private final MinioService minioService;
    private final FileService fileService;
    private final TagService tagService;
    private final NotificationService notificationService;
    private final ApplicationProperties applicationProperties;
    private ApplicationProperties.MinioConfiguration minioConfig;

    @PostConstruct
    private void init() {
        this.minioConfig = applicationProperties.minioConfiguration();
    }

    @Override
    public Page<ResourceResponseDto> getResources(ResourceCriteria criteria, Pageable pageable) {
        Page<ResourceResponseDto> resources = resourceRepository
                .findAll(ResourceSpecifications.byCriteria(criteria), pageable)
                .map(resourceMapper::toResourceResponseDto);
        return new PageImpl<>(
                resources.getContent(),
                pageable,
                resources.getTotalElements());
    }

    @Override
    public ResourceDetailResponseDto getResourceById(UUID id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Resource not found with id: " + id));
        resource.setViewNumber(resource.getViewNumber() + 1);
        resourceRepository.save(resource);
        return resourceMapper.toResourceDetailResponseDto(resource);
    }

    @Override
    public List<UUID> createResource(CreateResourceRequest createResourceRequest) {
        if (createResourceRequest.getType() == UploadType.COMPRESSED) {
            return new ArrayList<>();
        }

        List<Resource> resources = createResourceRequest.getMetadata().stream().map(
                request -> {
                    Resource resource = new Resource();
                    resourceMapper.toResource(resource, request);
                    UUID id = UUID.randomUUID();
                    resource.setId(id);
                    resource.setCreatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
                    resource.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));

                    if (Objects.isNull(resource.getState())) {
                        resource.setState(Resource.ResourceState.UNLISTED);
                    }
                    if (Objects.nonNull(request.getThumbnail())) {
                        resource.setThumbnail(request.getThumbnail().toString());
                    }
                    if (Objects.nonNull(createResourceRequest.getType())) {
                        resource.setType(getUploadTypeCreateResource(createResourceRequest.getType()));
                    }
                    if (Objects.nonNull(request.getObjectKey())) {
                        String objectKey = request.getObjectKey().toString();
                        resource.setPath(objectKey);

                        // Set thumbnail name based on objectKey (webhook will generate the file)
                        String baseName = objectKey;
                        if (objectKey.contains(".")) {
                            baseName = objectKey.substring(0, objectKey.lastIndexOf("."));
                        }
                        resource.setThumbnail(Constants.TEMPLATE_THUMBNAIL_NAME + baseName);
                    }
                    return resource;
                }).toList();

        resourceRepository.saveAll(resources);
        return resources.stream().map(Resource::getId).toList();
    }

    @Override
    public void updateResource(UUID id, UpdateResourceRequestDto updateResourceDto) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Resource with id not found " + id));
        resource.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));

        // update thumbnail - only if explicitly provided
        UUID thumbnailDto = updateResourceDto.getThumbnail();
        if (Objects.nonNull(thumbnailDto)) {
            if (!StringUtils.equalsIgnoreCase(resource.getThumbnail(), thumbnailDto.toString()) &&
                    StringUtils.isNotBlank(resource.getThumbnail())) {
                minioService.removeFile(resource.getThumbnail(), minioConfig.bucketThumbnail());
            }
            resource.setThumbnail(thumbnailDto.toString());
        }

        // update path attachment - only if explicitly provided
        UUID attachmentDto = updateResourceDto.getAttachment();
        if (Objects.nonNull(attachmentDto)) {
            String newObjectKey = attachmentDto.toString();

            // Remove old file from MinIO if different
            if (!StringUtils.equalsIgnoreCase(resource.getPath(), newObjectKey) &&
                    StringUtils.isNotBlank(resource.getPath())) {
                minioService.removeFile(resource.getPath(),
                        minioService.getBucketFromResourceType(resource.getType().getValue()));

                // Also remove old thumbnails
                if (StringUtils.isNotBlank(resource.getThumbnail())) {
                    minioService.removeFile(resource.getThumbnail(), minioConfig.bucketThumbnail());
                    minioService.removeFile(Constants.TEMPLATE_SMALL_THUMBNAIL_NAME +
                            resource.getThumbnail().replace(Constants.TEMPLATE_THUMBNAIL_NAME, ""),
                            minioConfig.bucketThumbnail());
                }
            }

            // Update path
            resource.setPath(newObjectKey);

            // Update thumbnail name to match new file
            // Webhook will generate the actual thumbnail files
            String baseName = newObjectKey;
            if (newObjectKey.contains(".")) {
                baseName = newObjectKey.substring(0, newObjectKey.lastIndexOf("."));
            }
            resource.setThumbnail(Constants.TEMPLATE_THUMBNAIL_NAME + baseName);
        }
        resourceMapper.toResource(resource, updateResourceDto);
        resourceRepository.save(resource);
    }

    @Override
    public void deleteResource(UUID id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Resource with id not found: " + id));

        // Delete from MinIO
        if (StringUtils.isNotBlank(resource.getPath())) {
            String bucket = minioService.getBucketFromResourceType(resource.getType().getValue());
            minioService.removeFile(resource.getPath(), bucket);
        }
        if (StringUtils.isNotBlank(resource.getThumbnail())) {
            minioService.removeFile(resource.getThumbnail(), minioConfig.bucketThumbnail());
        }

        resourceRepository.deleteById(id);
    }

    @Override
    public void deleteResources(List<UUID> ids) {
        List<Resource> resources = resourceRepository.findAllById(ids);
        if (resources.isEmpty()) {
            log.info("No resources found to delete");
            return;
        }

        // Delete from MinIO
        List<String> imagePaths = new ArrayList<>();
        List<String> videoPaths = new ArrayList<>();
        List<String> thumbnails = new ArrayList<>();

        for (Resource resource : resources) {
            if (StringUtils.isNotBlank(resource.getPath())) {
                if (StringUtils.equalsIgnoreCase(resource.getType().getValue(), Constants.IMAGE_RESOURCE_TYPE)) {
                    imagePaths.add(resource.getPath());
                } else if (StringUtils.equalsIgnoreCase(resource.getType().getValue(), Constants.VIDEO_RESOURCE_TYPE)) {
                    videoPaths.add(resource.getPath());
                }
            }
            if (StringUtils.isNotBlank(resource.getThumbnail())) {
                thumbnails.add(resource.getThumbnail());
            }
        }

        if (!imagePaths.isEmpty()) {
            minioService.removeFiles(imagePaths, minioConfig.bucketImage());
        }
        if (!videoPaths.isEmpty()) {
            minioService.removeFiles(videoPaths, minioConfig.bucketVideo());
        }
        if (!thumbnails.isEmpty()) {
            minioService.removeFiles(thumbnails, minioConfig.bucketThumbnail());
        }

        resourceRepository.deleteAll(resources);
    }

    @Override
    @SneakyThrows
    public void createThumbnail(MultipartFile file) {
        fileService.createAndUploadThumbnail(file, Constants.THUMBNAIL_DIMENSION,
                Constants.TEMPLATE_THUMBNAIL_NAME);
        fileService.createAndUploadThumbnail(file, Constants.SMALL_THUMBNAIL_DIMENSION,
                Constants.TEMPLATE_SMALL_THUMBNAIL_NAME);
    }

    @Override
    @SneakyThrows
    public void removeThumbnail(String... thumbnailPaths) {
        for (String thumbnailPath : thumbnailPaths) {
            minioService.removeFile(thumbnailPath, minioConfig.bucketThumbnail());
        }
    }

    @Override
    public void updateResourceThumbnail(String objectKey) {
        // Find resource by path
        Optional<Resource> resourceOpt = resourceRepository.findResourceByPath(objectKey);

        if (resourceOpt.isEmpty()) {
            log.warn("Resource not found for path: {}", objectKey);
            return;
        }

        Resource resource = resourceOpt.get();
        String bucketName = minioService.getBucketFromResourceType(resource.getType().getValue());

        // Get file from MinIO to calculate metadata
        try (InputStream fileStream = minioService.getFile(bucketName, objectKey)) {
            if (fileStream == null) {
                log.error("Failed to get file from MinIO for metadata update: {}", objectKey);
                return;
            }

            // Convert to MultipartFile to use utility methods
            String contentType = FileUtil.getFileExtension(objectKey);
            MultipartFile file = FileUtil.toMultipartFile(fileStream, objectKey, contentType);

            // Update file metadata
            var webResourceType = convertToWebResourceType(resource.getType());
            resource.setDimension(ResourceUtil.getDimensions(file, webResourceType));
            resource.setSize(ResourceUtil.getSize(file));

            // Set extension from filename
            if (objectKey.contains(".")) {
                resource.setExtension(objectKey.substring(objectKey.lastIndexOf(".") + 1));
            }

            // Update video duration if it's a video
            if (resource.getType() == ResourceType.VIDEO) {
                resource.setTime(FileUtil.getVideoDuration(file));
            }

        } catch (Exception e) {
            log.error("Failed to update resource metadata for {}: {}", objectKey, e.getMessage(), e);
        }

        // Extract base name without extension: uuid_filename.ext -> uuid_filename
        String baseName = objectKey;
        if (objectKey.contains(".")) {
            baseName = objectKey.substring(0, objectKey.lastIndexOf("."));
        }

        // Build thumbnail name: thumbnail_uuid_filename
        String thumbnailName = Constants.TEMPLATE_THUMBNAIL_NAME + baseName;

        // Update resource
        resource.setThumbnail(thumbnailName);
        resource.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        resourceRepository.save(resource);

        log.info("Updated resource {} with thumbnail and metadata: {}", resource.getId(), thumbnailName);
    }

    @Override
    public void handleCompressedFile(MultipartFile file) {
        // Extract session ID from filename (format: sessionId_originalName.zip)
        String fileName = file.getOriginalFilename();
        String sessionId = extractSessionId(fileName);

        try {
            var fileMap = fileService.processCompressedFile(file);
            int totalFiles = fileMap.size();
            log.info("Handle compressed file with {} files, session: {}", totalFiles, sessionId);

            // Notify start
            notificationService.notifyUploadProgress(sessionId, 0, totalFiles,
                    "Starting extraction...");

            List<MultipartFile> files = fileMap.keySet().stream().map(ExtractedFile::getFile).toList();
            List<CreateResourceRequestDto> metadataList = fileMap.entrySet().stream().map(entry -> {
                ExtractedFile extractedFile = entry.getKey();
                CreateResourceRequestDto metadata = entry.getValue();

                List<String> tags = extractedFile.getTag();
                if (CollectionUtils.isEmpty(tags)) {
                    return metadata;
                }
                List<String> regularTags = new ArrayList<>();
                List<String> detailTags = new ArrayList<>();

                for (String tag : tags) {
                    if (tagService.isDetailTag(tag)) {
                        detailTags.add(tag);
                    } else {
                        regularTags.add(tag);
                    }
                }
                metadata.setTag(regularTags);
                metadata.setDetailTag(detailTags);

                return metadata;
            }).toList();

            handleMultipleFile(files, metadataList, sessionId);

            // Notify completion
            notificationService.notifyUploadSuccess(sessionId, totalFiles + " files imported successfully");
        } catch (Exception e) {
            log.error("Failed to process compressed file: {}", e.getMessage(), e);
            notificationService.notifyZipUploadFailure(sessionId, "Failed to process ZIP file: " + e.getMessage());
            throw e;
        }
    }

    private String extractSessionId(String fileName) {
        if (fileName != null && fileName.contains("_")) {
            return fileName.substring(0, fileName.indexOf("_"));
        }
        return UUID.randomUUID().toString(); // Fallback
    }

    @Override
    public void handleMultipleFile(List<MultipartFile> files, List<CreateResourceRequestDto> metadataList) {
        handleMultipleFile(files, metadataList, null);
    }

    private void handleMultipleFile(List<MultipartFile> files, List<CreateResourceRequestDto> metadataList,
            String sessionId) {
        int totalFiles = files.size();
        log.info("Handle multiple files: {}, session: {}", totalFiles, sessionId);

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            CreateResourceRequestDto metadata = metadataList.get(i);

            // Determine resource type
            ResourceType type = getResourceTypeFromFile(file);
            String bucketName = minioService.getBucketFromResourceType(type.getValue());

            // Upload file to MinIO with progress tracking
            UUID id = UUID.randomUUID();
            String fileName = id + Constants.UNDERSCORE + file.getOriginalFilename();

            // Send progress update
            if (sessionId != null) {
                int processed = i + 1;
                notificationService.notifyUploadProgress(sessionId, processed, totalFiles,
                        "Processing " + file.getOriginalFilename() + " (" + processed + "/" + totalFiles + ")");
            }

            // Use chunked upload for compressed file extraction (always has progress)
            minioService.uploadChunk(file, bucketName, fileName);

            // Create resource in database
            createResource(metadata, file, type, fileName);
        }
    }

    private void createResource(CreateResourceRequestDto request, MultipartFile file,
            ResourceType type, String fileName) {
        Resource resource = new Resource();
        resourceMapper.toResource(resource, request);
        resource.setType(type);
        resource.setPath(fileName);
        resource.setCreatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        resource.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));

        // Convert domain ResourceType to web ResourceType for utility method
        var webResourceType = convertToWebResourceType(type);
        resource.setDimension(ResourceUtil.getDimensions(file, webResourceType));
        resource.setSize(ResourceUtil.getSize(file));

        if (Objects.nonNull(request.getThumbnail()) &&
                StringUtils.isNotBlank(request.getThumbnail().toString())) {
            resource.setThumbnail(request.getThumbnail().toString());
        }

        if (type == ResourceType.VIDEO) {
            resource.setTime(FileUtil.getVideoDuration(file));
        }

        // Set expected thumbnail name (will be generated by webhook)
        String baseName = fileName.contains(".")
                ? fileName.substring(0, fileName.lastIndexOf("."))
                : fileName;
        resource.setThumbnail(Constants.TEMPLATE_THUMBNAIL_NAME + baseName);

        resourceRepository.saveAndFlush(resource);
    }

    private com.endo4life.web.rest.model.ResourceType convertToWebResourceType(ResourceType type) {
        return switch (type) {
            case VIDEO -> com.endo4life.web.rest.model.ResourceType.VIDEO;
            case IMAGE -> com.endo4life.web.rest.model.ResourceType.IMAGE;
            case AVATAR -> com.endo4life.web.rest.model.ResourceType.AVATAR;
            case THUMBNAIL -> com.endo4life.web.rest.model.ResourceType.THUMBNAIL;
            case BOOK -> com.endo4life.web.rest.model.ResourceType.BOOK;
            case OTHER -> com.endo4life.web.rest.model.ResourceType.OTHER;
            case PROCESS -> com.endo4life.web.rest.model.ResourceType.PROCESS;
        };
    }

    private ResourceType getResourceTypeFromFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null) {
            if (contentType.startsWith("video/")) {
                return ResourceType.VIDEO;
            } else if (contentType.startsWith("image/")) {
                return ResourceType.IMAGE;
            }
        }
        return ResourceType.OTHER;
    }

    private ResourceType getUploadTypeCreateResource(UploadType uploadType) {
        if (StringUtils.equalsIgnoreCase(uploadType.getValue(), Constants.VIDEO_RESOURCE_TYPE)) {
            return ResourceType.VIDEO;
        }
        if (StringUtils.equalsIgnoreCase(uploadType.getValue(), Constants.IMAGE_RESOURCE_TYPE)) {
            return ResourceType.IMAGE;
        }
        if (StringUtils.equalsIgnoreCase(uploadType.getValue(), "BOOK")) {
            return ResourceType.BOOK;
        }
        if (StringUtils.equalsIgnoreCase(uploadType.getValue(), Constants.OTHER_RESOURCE_TYPE)) {
            return ResourceType.OTHER;
        }
        return null;
    }
}

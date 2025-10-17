package com.endo4life.service.resource;

import com.endo4life.domain.dto.ExtractedFile;
import com.endo4life.service.file.FileService;
import com.endo4life.service.minio.MinioService;
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
                        resource.setPath(request.getObjectKey().toString());
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
            if (!StringUtils.equalsIgnoreCase(resource.getPath(), attachmentDto.toString()) &&
                    StringUtils.isNotBlank(resource.getPath())) {
                minioService.removeFile(resource.getPath(),
                        minioService.getBucketFromResourceType(resource.getType().getValue()));
            }
            resource.setPath(attachmentDto.toString());
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

        log.info("Updated resource {} with thumbnail: {}", resource.getId(), thumbnailName);
    }

    @Override
    public void handleCompressedFile(MultipartFile file) {
        var fileMap = fileService.processCompressedFile(file);
        log.info("Handle compressed file with {} files", fileMap.size());
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
        handleMultipleFile(files, metadataList);
    }

    @Override
    public void handleMultipleFile(List<MultipartFile> files, List<CreateResourceRequestDto> metadataList) {
        log.info("Handle multiple files: {}", files.size());
        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            CreateResourceRequestDto metadata = metadataList.get(i);

            // Determine resource type
            ResourceType type = getResourceTypeFromFile(file);
            String bucketName = minioService.getBucketFromResourceType(type.getValue());

            // Upload file to MinIO with progress tracking
            UUID id = UUID.randomUUID();
            String fileName = id + Constants.UNDERSCORE + file.getOriginalFilename();

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
        if (StringUtils.equalsIgnoreCase(uploadType.getValue(), Constants.OTHER_RESOURCE_TYPE)) {
            return ResourceType.OTHER;
        }
        return null;
    }
}

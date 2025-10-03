package com.endo4life.service.resource;

import com.endo4life.service.file.FileService;
import com.endo4life.service.minio.MinioService;
import com.endo4life.utils.minio.MinIOUtil;
import com.endo4life.web.rest.model.*;
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
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
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
                        resource.setState(com.endo4life.domain.document.Resource.ResourceState.UNLISTED);
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

        // update thumbnail
        UUID thumbnailDto = updateResourceDto.getThumbnail();
        if (Objects.isNull(thumbnailDto) && StringUtils.isNotBlank(resource.getThumbnail())) {
            minioService.removeFile(resource.getThumbnail(), minioConfig.bucketThumbnail());
            resource.setThumbnail(null);
        }
        if (Objects.nonNull(thumbnailDto)) {
            if (!StringUtils.equalsIgnoreCase(resource.getThumbnail(), thumbnailDto.toString()) &&
                    StringUtils.isNotBlank(resource.getThumbnail())) {
                minioService.removeFile(resource.getThumbnail(), minioConfig.bucketThumbnail());
            }
            resource.setThumbnail(thumbnailDto.toString());
        }

        // update path attachment if have!
        UUID attachmentDto = updateResourceDto.getAttachment();
        if (Objects.isNull(attachmentDto) && StringUtils.isNotBlank(resource.getPath())) {
            minioService.removeFile(resource.getPath(),
                    minioService.getBucketFromResourceType(resource.getType().getValue()));
            resource.setPath(null);
        }
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

    private com.endo4life.domain.document.Resource.ResourceType getUploadTypeCreateResource(UploadType uploadType) {
        if (StringUtils.equalsIgnoreCase(uploadType.getValue(), Constants.VIDEO_RESOURCE_TYPE)) {
            return com.endo4life.domain.document.Resource.ResourceType.VIDEO;
        }
        if (StringUtils.equalsIgnoreCase(uploadType.getValue(), Constants.IMAGE_RESOURCE_TYPE)) {
            return com.endo4life.domain.document.Resource.ResourceType.IMAGE;
        }
        if (StringUtils.equalsIgnoreCase(uploadType.getValue(), Constants.OTHER_RESOURCE_TYPE)) {
            return com.endo4life.domain.document.Resource.ResourceType.OTHER;
        }
        return null;
    }
}

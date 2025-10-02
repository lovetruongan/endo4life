package com.endo4life.service.resource;

import com.endo4life.web.rest.model.CreateResourceRequest;
import com.endo4life.web.rest.model.ResourceCriteria;
import com.endo4life.web.rest.model.ResourceDetailResponseDto;
import com.endo4life.web.rest.model.ResourceResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ResourceService {
    Page<ResourceResponseDto> getResources(ResourceCriteria criteria, Pageable pageable);

    ResourceDetailResponseDto getResourceById(UUID id);

    List<UUID> createResource(CreateResourceRequest createResourceRequest);

    void deleteResource(UUID id);

    void deleteResources(List<UUID> ids);

    void createThumbnail(MultipartFile file);

    void removeThumbnail(String... thumbnailPaths);
}

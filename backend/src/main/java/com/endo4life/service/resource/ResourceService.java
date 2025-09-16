package com.endo4life.service.resource;

import com.endo4life.web.rest.model.ResourceCriteria;
import com.endo4life.web.rest.model.ResourceDetailResponseDto;
import com.endo4life.web.rest.model.ResourceResponseDto;
import com.endo4life.web.rest.model.CreateResourceRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ResourceService {
    Page<ResourceResponseDto> getResources(ResourceCriteria criteria, Pageable pageable);

    ResourceDetailResponseDto getResourceById(UUID id);

    UUID createResource(CreateResourceRequestDto createResourceRequestDto);

    void deleteResource(UUID id);
}

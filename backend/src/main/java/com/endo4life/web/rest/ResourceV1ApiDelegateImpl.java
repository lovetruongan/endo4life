package com.endo4life.web.rest;

import com.endo4life.web.rest.api.ResourceV1ApiDelegate;
import com.endo4life.web.rest.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.endo4life.service.resource.ResourceService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class ResourceV1ApiDelegateImpl implements ResourceV1ApiDelegate {

    private final ResourceService resourceService;

    @Override
    public ResponseEntity<ResourceResponsePaginatedDto> getResources(ResourceCriteria criteria, Pageable pageable) {
        var result = resourceService.getResources(criteria, pageable);
        return ResponseEntity.ok(
                new ResourceResponsePaginatedDto()
                        .data(result.getContent())
                        .total(result.getTotalElements()));
    }

    @Override
    public ResponseEntity<List<UUID>> createResource(CreateResourceRequest createResourceRequest) {
        return ResponseEntity.ok(resourceService.createResource(createResourceRequest));
    }

    @Override
    public ResponseEntity<ResourceDetailResponseDto> getResourceById(UUID id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @Override
    public ResponseEntity<Void> updateResource(UUID id,
            UpdateResourceRequestDto updateResourceRequest) {
        resourceService.updateResource(id, updateResourceRequest);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> deleteResource(UUID id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<Void> deleteResources(List<UUID> ids) {
        resourceService.deleteResources(ids);
        return ResponseEntity.noContent().build();
    }
}

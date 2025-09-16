package com.endo4life.web.rest;

import com.endo4life.web.rest.api.ResourceV1ApiDelegate;
import com.endo4life.web.rest.model.ResourceCriteria;
import com.endo4life.web.rest.model.ResourceDetailResponseDto;
import com.endo4life.web.rest.model.ResourceResponsePaginatedDto;
import com.endo4life.web.rest.model.CreateResourceRequestDto;
import com.endo4life.web.rest.model.IdWrapperDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.endo4life.service.resource.ResourceService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

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
    public ResponseEntity<IdWrapperDto> createResource(CreateResourceRequestDto createResourceRequest) {
        UUID id = resourceService.createResource(createResourceRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(new IdWrapperDto().id(id));
    }

    @Override
    public ResponseEntity<ResourceDetailResponseDto> getResourceById(UUID id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }
}

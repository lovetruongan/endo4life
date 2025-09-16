package com.endo4life.service.resource;

import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.endo4life.constant.Constants;
import com.endo4life.domain.document.Resource;
import com.endo4life.mapper.ResourceMapper;
import com.endo4life.repository.ResourceRepository;
import com.endo4life.repository.specifications.ResourceSpecifications;
import com.endo4life.security.UserContextHolder;
import com.endo4life.web.rest.model.ResourceCriteria;
import com.endo4life.web.rest.model.CreateResourceRequestDto;
import com.endo4life.web.rest.model.ResourceDetailResponseDto;
import com.endo4life.web.rest.model.ResourceResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final ResourceMapper resourceMapper;

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
    public UUID createResource(CreateResourceRequestDto createResourceRequestDto) {
        Resource resource = resourceMapper.toResource(createResourceRequestDto);
        resource.setCreatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        resource.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        resourceRepository.save(resource);
        return resource.getId();
    }

    @Override
    public void deleteResource(UUID id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Resource with id not found: " + id));
        resourceRepository.deleteById(id);
    }
}

package com.endo4life.web.rest;

import com.endo4life.service.userresource.UserResourceService;
import com.endo4life.web.rest.api.UserResourceV1ApiDelegate;
import com.endo4life.web.rest.model.ResourceCriteria;
import com.endo4life.web.rest.model.UserResourceDetailResponseDto;
import com.endo4life.web.rest.model.UserResourceResponseDto;
import com.endo4life.web.rest.model.UserResourceResponsePaginatedDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserResourceV1ApiDelegateImpl implements UserResourceV1ApiDelegate {

    private final UserResourceService userResourceService;

    @Override
    public ResponseEntity<UserResourceResponsePaginatedDto> getUserResources(
            ResourceCriteria criteria,
            Pageable pageable) {
        Page<UserResourceResponseDto> pageUserResourceResponseDto = userResourceService.getUserResources(criteria,
                pageable);
        return ResponseEntity.ok(
                new UserResourceResponsePaginatedDto()
                        .data(pageUserResourceResponseDto.getContent())
                        .total(pageUserResourceResponseDto.getTotalElements()));
    }

    @Override
    public ResponseEntity<UserResourceDetailResponseDto> getUserResourceById(UUID id) {
        return ResponseEntity.ok(userResourceService.getUserResourceById(id));
    }
}

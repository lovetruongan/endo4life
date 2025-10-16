package com.endo4life.web.rest;

import com.endo4life.service.userresourcehistory.UserResourceHistoryService;
import com.endo4life.web.rest.model.IdWrapperDto;
import com.endo4life.web.rest.model.UserResourceHistoryCriteria;
import com.endo4life.web.rest.model.UserResourceType;
import com.endo4life.web.rest.model.UserResourcesAccessedResponseDto;
import com.endo4life.web.rest.model.UserResourcesAccessedResponsePaginatedDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserResourceHistoryV1ApiDelegateImpl
        implements com.endo4life.web.rest.api.UserResourceHistoryV1ApiDelegate {
    private final UserResourceHistoryService userResourceService;

    @Override
    public ResponseEntity<IdWrapperDto> createUserResource(UUID userInfoId, UUID resourceId, UserResourceType type) {
        UUID id = userResourceService.createUserResource(userInfoId, resourceId, type);
        return ResponseEntity.status(HttpStatus.CREATED).body(new IdWrapperDto().id(id));
    }

    @Override
    public ResponseEntity<UserResourcesAccessedResponsePaginatedDto> getResourcesAccessedByUserInfoIdAndType(
            UserResourceHistoryCriteria criteria,
            Pageable pageable) {
        Page<UserResourcesAccessedResponseDto> pageUserResourcesResponseDto = userResourceService
                .getResourcesByUserInfoIdAndType(criteria, pageable);
        return ResponseEntity.ok(
                new UserResourcesAccessedResponsePaginatedDto()
                        .data(pageUserResourcesResponseDto.getContent())
                        .total(pageUserResourcesResponseDto.getTotalElements()));
    }
}

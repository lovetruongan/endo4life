package com.endo4life.service.userresourcehistory;

import com.endo4life.constant.Constants;
import com.endo4life.domain.document.Resource;
import com.endo4life.domain.document.UserInfo;
import com.endo4life.domain.document.UserResource;
import com.endo4life.mapper.UserResourceMapper;
import com.endo4life.repository.ResourceRepository;
import com.endo4life.repository.UserInfoRepository;
import com.endo4life.repository.UserResourceHistoryRepository;
import com.endo4life.repository.specifications.UserResourceHistorySpecification;
import com.endo4life.security.UserContextHolder;
import com.endo4life.web.rest.errors.BadRequestException;
import com.endo4life.web.rest.model.UserResourceHistoryCriteria;
import com.endo4life.web.rest.model.UserResourceType;
import com.endo4life.web.rest.model.UserResourcesAccessedResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
public class UserResourceHistoryServiceImpl implements UserResourceHistoryService {

    private final UserResourceHistoryRepository userResourceRepository;
    private final UserInfoRepository userInfoRepository;
    private final ResourceRepository resourceRepository;
    private final UserResourceMapper userResourceMapper;

    @Override
    public UUID createUserResource(UUID userInfoId, UUID resourceId, UserResourceType userResourceType) {
        UserInfo userInfoEntity = userInfoRepository.findById(userInfoId)
                .orElseThrow(() -> new BadRequestException("userInfoEntity not found with id: " + userInfoId));
        Resource resourceEntity = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new BadRequestException("resourceEntity not found with id: " + resourceId));

        UserResource userResourceEntity = new UserResource();
        userResourceEntity.setUserInfo(userInfoEntity);
        userResourceEntity.setResource(resourceEntity);
        userResourceEntity.setType(userResourceType.getValue());
        userResourceEntity.setCreatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        userResourceEntity.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        userResourceRepository.save(userResourceEntity);
        return userResourceEntity.getId();
    }

    @Override
    public Page<UserResourcesAccessedResponseDto> getResourcesByUserInfoIdAndType(UserResourceHistoryCriteria criteria,
            Pageable pageable) {
        Page<UserResourcesAccessedResponseDto> userResources = userResourceRepository
                .findAll(UserResourceHistorySpecification.byCriteria(criteria), pageable)
                .map(userResourceMapper::toUserResourcesResponseDto);
        return new PageImpl<>(
                userResources.getContent(),
                pageable,
                userResources.getTotalElements());
    }
}

package com.endo4life.service.userresource;

import com.endo4life.domain.document.Resource;
import com.endo4life.domain.document.UserInfo;
import com.endo4life.mapper.ResourceMapper;
import com.endo4life.mapper.UserInfoMapper;
import com.endo4life.repository.ResourceRepository;
import com.endo4life.repository.UserInfoRepository;
import com.endo4life.repository.specifications.ResourceSpecifications;
import com.endo4life.web.rest.model.ResourceCriteria;
import com.endo4life.web.rest.model.ResourceState;
import com.endo4life.web.rest.model.UserResourceDetailResponseDto;
import com.endo4life.web.rest.model.UserResourceResponseDto;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UserResourceServiceImpl implements UserResourceService {

        private final ResourceRepository resourceRepository;
        private final ResourceMapper resourceMapper;
        private final UserInfoRepository userInfoRepository;
        private final UserInfoMapper userInfoMapper;

        @Override
        public Page<UserResourceResponseDto> getUserResources(ResourceCriteria resourceCriteria, Pageable pageable) {
                // Force only PUBLIC resources for student users while preserving all filters
                ResourceCriteria publicCriteria = new ResourceCriteria()
                                .state(ResourceState.PUBLIC)
                                .type(resourceCriteria.getType())
                                .title(resourceCriteria.getTitle())
                                .tag(resourceCriteria.getTag())
                                .detailTag(resourceCriteria.getDetailTag())
                                .endoscopyTag(resourceCriteria.getEndoscopyTag())
                                .hpTag(resourceCriteria.getHpTag())
                                .lightTag(resourceCriteria.getLightTag())
                                .locationUpperTag(resourceCriteria.getLocationUpperTag());

                Page<UserResourceResponseDto> pageUserResourceResponseDto = resourceRepository
                                .findAll(ResourceSpecifications.byCriteria(publicCriteria), pageable)
                                .map(resourceMapper::toUserResourceResponseDto);

                return new PageImpl<>(
                                pageUserResourceResponseDto.getContent(),
                                pageable,
                                pageUserResourceResponseDto.getTotalElements());
        }

        @Override
        public UserResourceDetailResponseDto getUserResourceById(UUID id) {
                Resource resource = resourceRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Resource not found with id: " + id));

                // Increment view count
                resource.setViewNumber(resource.getViewNumber() + 1);
                resourceRepository.save(resource);

                UserResourceDetailResponseDto userResourceDetailResponseDto = resourceMapper
                                .toUserResourceDetailResponseDto(resource);

                // Fetch and set creator info
                Set<String> setCreatedBy = new HashSet<>();
                setCreatedBy.add(resource.getCreatedBy());
                Optional<UserInfo> optionalUserInfo = userInfoRepository.findAllByEmails(setCreatedBy).stream()
                                .findFirst();

                if (optionalUserInfo.isPresent()) {
                        UserInfo userInfo = optionalUserInfo.get();
                        userResourceDetailResponseDto.setCreatedByInfo(
                                        userInfoMapper.toUserInfoDto(userInfo));
                }

                return userResourceDetailResponseDto;
        }
}

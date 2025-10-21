package com.endo4life.mapper;

import com.endo4life.domain.document.DoctorUserConversations;
import com.endo4life.service.minio.MinioService;
import com.endo4life.config.ApplicationProperties;
import com.endo4life.web.rest.model.CreateDoctorUserConversationDto;
import com.endo4life.web.rest.model.DoctorUserConversationResponseDto;
import com.endo4life.web.rest.model.UpdateDoctorUserConversationDto;
import com.endo4life.web.rest.model.UserInfoDto;
import org.apache.commons.lang3.StringUtils;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PostConstruct;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = { DateTimeMapper.class })
@Slf4j
public abstract class DoctorUserConversationMapper {

    @Autowired
    protected MinioService minioService;

    @Autowired
    protected ApplicationProperties applicationProperties;

    protected ApplicationProperties.MinioConfiguration minioConfig;

    @PostConstruct
    private void init() {
        this.minioConfig = applicationProperties.minioConfiguration();
    }

    @Mapping(target = "questioner", ignore = true) // Set from JWT in service
    @Mapping(target = "assignee", ignore = true) // Set from assigneeId in service
    @Mapping(target = "resource", ignore = true) // Set from resourceId in service
    @Mapping(target = "parent", ignore = true) // Set from parentId in service
    @Mapping(target = "attachmentUrls", ignore = true) // Set after file upload in service
    @Mapping(target = "typeAttachment", ignore = true) // Set in service based on upload
    public abstract DoctorUserConversations toEntity(CreateDoctorUserConversationDto dto);

    @Mapping(source = "resource.id", target = "resourceId")
    @Mapping(source = "parent.id", target = "parentId")
    @Mapping(source = "questioner", target = "questionerInfo", qualifiedByName = "userInfoToDto")
    @Mapping(source = "assignee", target = "assigneeInfo", qualifiedByName = "userInfoToDto")
    @Mapping(target = "replies", ignore = true) // Handle in service
    @Mapping(target = "attachmentUrls", ignore = true) // Handle in service to convert JSON to array
    @Mapping(target = "createdAt", ignore = true) // Handle in service
    @Mapping(target = "updatedAt", ignore = true) // Handle in service
    public abstract DoctorUserConversationResponseDto toResponseDto(DoctorUserConversations entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "questioner", ignore = true)
    @Mapping(target = "resource", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "attachmentUrls", ignore = true)
    @Mapping(target = "assignee", ignore = true) // Handle in service
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "typeAttachment", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    public abstract void updateEntityFromDto(@MappingTarget DoctorUserConversations entity,
            UpdateDoctorUserConversationDto dto);

    @Named("userInfoToDto")
    UserInfoDto userInfoToDto(com.endo4life.domain.document.UserInfo userInfo) {
        if (userInfo == null) {
            return null;
        }
        UserInfoDto dto = new UserInfoDto();
        dto.setId(userInfo.getId());
        dto.setFirstName(userInfo.getFirstName());
        dto.setLastName(userInfo.getLastName());
        dto.setEmail(userInfo.getEmail());

        // Generate avatarUrl presigned URL if avatar path exists
        if (StringUtils.isNotBlank(userInfo.getAvatarPath())) {
            try {
                String avatarUrl = minioService.createGetPreSignedLink(
                        userInfo.getAvatarPath(),
                        minioConfig.bucketAvatar());
                if (StringUtils.isNotBlank(avatarUrl)) {
                    dto.setAvatarUrl(avatarUrl);
                }
            } catch (Exception e) {
                log.error("Failed to generate avatar presigned URL for: {}", userInfo.getAvatarPath(), e);
            }
        }

        return dto;
    }
}

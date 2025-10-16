package com.endo4life.mapper;

import com.endo4life.domain.document.DoctorUserConversations;
import com.endo4life.web.rest.model.CreateDoctorUserConversationDto;
import com.endo4life.web.rest.model.DoctorUserConversationResponseDto;
import com.endo4life.web.rest.model.UpdateDoctorUserConversationDto;
import com.endo4life.web.rest.model.UserInfoDto;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = { DateTimeMapper.class })
public abstract class DoctorUserConversationMapper {

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
        dto.setFirstName(userInfo.getFirstName());
        dto.setLastName(userInfo.getLastName());
        dto.setEmail(userInfo.getEmail());
        // TODO: Add avatarUrl conversion if needed
        return dto;
    }
}

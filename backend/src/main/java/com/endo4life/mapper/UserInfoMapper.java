package com.endo4life.mapper;

import java.util.List;
import java.util.Set;
import com.endo4life.web.rest.model.CreateUserRequestDto;
import com.endo4life.web.rest.model.InviteUserRequestDto;
import com.endo4life.web.rest.model.UpdateUserRequestDto;
import com.endo4life.web.rest.model.UserInfoDto;
import com.endo4life.web.rest.model.UserResponseDto;
import com.endo4life.domain.document.UserInfo;
import com.endo4life.utils.StringUtil;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = { DateTimeMapper.class })
public abstract class UserInfoMapper {

    @Mapping(target = "username", source = "email", qualifiedByName = "emailToUsername")
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "userRegistrationCourses", ignore = true)
    public abstract UserInfo toUserInfo(CreateUserRequestDto createUserRequestDto);

    @Mapping(target = "username", source = "email", qualifiedByName = "emailToUsername")
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "userRegistrationCourses", ignore = true)
    public abstract UserInfo toUserInfo(InviteUserRequestDto inviteUserRequestDto);

    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "avatarLink", source = "userInfo.avatarPath", qualifiedByName = "avatarPathToLink")
    @Mapping(target = "certificateLinks", source = "userInfo.certificatePath", qualifiedByName = "certificatePathToList")
    public abstract UserResponseDto toUserResponseDto(UserInfo userInfo);

    @Mapping(target = "username", source = "email", qualifiedByName = "emailToUsername")
    public abstract CreateUserRequestDto toCreateUserRequestDto(InviteUserRequestDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "avatarUrl", source = "userInfo.avatarPath", qualifiedByName = "avatarPathToLink")
    public abstract UserInfoDto toUserInfoDto(UserInfo userInfo);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "avatarPath", ignore = true)
    @Mapping(target = "certificatePath", ignore = true)
    @Mapping(target = "isUpdatedProfile", ignore = true)
    @Mapping(target = "disabledAt", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "userRegistrationCourses", ignore = true)
    public abstract void updateUserInfo(@MappingTarget UserInfo userInfo,
            UpdateUserRequestDto updateUserRequestDto);

    @Named("avatarPathToLink")
    public String avatarPathToLink(String avatarResourcePath) {
        if (StringUtils.isBlank(avatarResourcePath)) {
            return null;
        }
        // TODO: Implement MinIO presigned URL generation
        return avatarResourcePath;
    }

    @Named("certificatePathToList")
    public List<String> certificatePathToSet(Set<String> certificatePaths) {
        if (CollectionUtils.isEmpty(certificatePaths)) {
            return List.of();
        }
        // TODO: Implement MinIO presigned URL generation
        return certificatePaths.stream().toList();
    }

    @Named("emailToUsername")
    public String emailToUsername(String email) {
        return StringUtil.removeEmailSuffix(email);
    }
}

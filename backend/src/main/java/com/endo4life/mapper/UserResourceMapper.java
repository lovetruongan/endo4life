package com.endo4life.mapper;

import com.endo4life.domain.document.UserResource;
import com.endo4life.web.rest.model.UserResourcesAccessedResponseDto;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = { ResourceMapper.class, DateTimeMapper.class })
public abstract class UserResourceMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "resource", source = "userResource.resource")
    @Mapping(target = "createdAt", source = "userResource.createdAt", qualifiedByName = "toOffsetDateTime")
    public abstract UserResourcesAccessedResponseDto toUserResourcesResponseDto(UserResource userResource);
}

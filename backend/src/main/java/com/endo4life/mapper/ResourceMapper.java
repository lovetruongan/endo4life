package com.endo4life.mapper;

import com.endo4life.domain.document.Resource;
import com.endo4life.web.rest.model.CreateResourceRequestDto;
import com.endo4life.web.rest.model.ResourceDetailResponseDto;
import com.endo4life.web.rest.model.ResourceResponseDto;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = { DateTimeMapper.class })
public abstract class ResourceMapper {

    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "thumbnailUrl", ignore = true)
    @Mapping(target = "tags", ignore = true)
    public abstract ResourceDetailResponseDto toResourceDetailResponseDto(Resource resource);

    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "thumbnailUrl", ignore = true)
    @Mapping(target = "tags", ignore = true)
    public abstract ResourceResponseDto toResourceResponseDto(Resource resource);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract Resource toResource(CreateResourceRequestDto createRequest);
}

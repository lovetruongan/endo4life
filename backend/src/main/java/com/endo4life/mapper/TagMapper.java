package com.endo4life.mapper;

import com.endo4life.domain.document.Tag;
import com.endo4life.web.rest.model.TagResponseDto;
import org.mapstruct.Mapper;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING)
public interface TagMapper {
    TagResponseDto toTagResponseDto(Tag tag);
}

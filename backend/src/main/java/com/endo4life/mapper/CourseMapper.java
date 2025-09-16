package com.endo4life.mapper;

import com.endo4life.domain.document.Course;
import com.endo4life.web.rest.model.CourseResponseDto;
import com.endo4life.web.rest.model.CreateCourseRequestDto;
import com.endo4life.web.rest.model.CourseDetailResponseDto;
import com.endo4life.web.rest.model.UpdateCourseRequestDto;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = { DateTimeMapper.class })
public abstract class CourseMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "tagsDetail", ignore = true)
    public abstract Course toCourse(CreateCourseRequestDto courseDto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "tagsDetail", ignore = true)
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "thumbnailUrl", ignore = true)
    @Mapping(target = "courseSections", ignore = true)
    public abstract CourseDetailResponseDto toCourseDetailResponseDto(Course course);

    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "tagsDetail", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "courseSections", ignore = true)
    public abstract void toCourse(@MappingTarget Course course, UpdateCourseRequestDto updateCourseRequestDto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "tagsDetail", ignore = true)
    @Mapping(target = "thumbnailUrl", ignore = true)
    public abstract CourseResponseDto toCourseResponseDto(Course course);
}

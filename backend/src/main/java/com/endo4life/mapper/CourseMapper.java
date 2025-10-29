package com.endo4life.mapper;

import com.endo4life.domain.document.Course;
import com.endo4life.service.minio.MinioService;
import com.endo4life.web.rest.model.CourseResponseDto;
import com.endo4life.web.rest.model.CreateCourseRequestDto;
import com.endo4life.web.rest.model.CourseDetailResponseDto;
import com.endo4life.web.rest.model.UpdateCourseRequestDto;
import org.apache.commons.lang3.StringUtils;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.Objects;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = { DateTimeMapper.class })
public abstract class CourseMapper {

    @Autowired
    protected MinioService minioService;

    @Value("${spring.application.minio-configuration.bucket-thumbnail:thumbnails}")
    protected String bucketThumbnail;

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "tagsDetail", ignore = true)
    public abstract Course toCourse(CreateCourseRequestDto courseDto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "tagsDetail", ignore = true)
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "toOffsetDateTime")
    @Mapping(target = "thumbnailUrl", source = "course", qualifiedByName = "thumbnailToUrl")
    @Mapping(target = "courseSections", ignore = true)
    public abstract CourseDetailResponseDto toCourseDetailResponseDto(Course course);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
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
    @Mapping(target = "thumbnailUrl", source = "course", qualifiedByName = "thumbnailToUrl")
    public abstract CourseResponseDto toCourseResponseDto(Course course);

    @Named("thumbnailToUrl")
    public String thumbnailToUrl(Course course) {
        if (Objects.isNull(course)) {
            return null;
        }
        String thumbnail = course.getThumbnail();
        if (StringUtils.isBlank(thumbnail)) {
            return null;
        }
        return minioService.createGetPreSignedLink(thumbnail, bucketThumbnail);
    }
}

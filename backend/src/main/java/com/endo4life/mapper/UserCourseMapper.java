package com.endo4life.mapper;

import com.endo4life.domain.document.Course;
import com.endo4life.service.minio.MinioService;
import com.endo4life.web.rest.model.UserCourseResponseDto;
import com.endo4life.web.rest.model.UserResponseDetailCourseDto;
import org.apache.commons.lang3.StringUtils;
import org.mapstruct.AfterMapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = { DateTimeMapper.class })
public abstract class UserCourseMapper {
    @Autowired
    private MinioService minioService;
    @Value("${spring.application.minio-configuration.bucket-thumbnail}")
    private String bucketThumbnail;

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract UserCourseResponseDto toUserCourseResponseDto(Course course);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "tagsDetail", ignore = true)
    public abstract UserResponseDetailCourseDto toUserResponseDetailCourseDto(Course course);

    @AfterMapping
    protected void updateThumbnailUrlsPageCourse(@MappingTarget UserCourseResponseDto userCourseResponseDto,
            Course course) {
        if (StringUtils.isNotBlank(course.getThumbnail())) {
            userCourseResponseDto.setThumbnailUrl(
                    minioService.createGetPreSignedLink(course.getThumbnail(), bucketThumbnail));
        }
    }

    @AfterMapping
    protected void updateThumbnailUrlUserDetailCourse(
            @MappingTarget UserResponseDetailCourseDto userResponseDetailCourseDto, Course course) {
        if (StringUtils.isNotBlank(course.getThumbnail())) {
            userResponseDetailCourseDto.setThumbnailUrl(
                    minioService.createGetPreSignedLink(course.getThumbnail(), bucketThumbnail));
        }
    }
}

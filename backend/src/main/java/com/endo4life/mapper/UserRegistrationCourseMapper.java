package com.endo4life.mapper;

import com.endo4life.constant.Constants;
import com.endo4life.domain.document.UserRegistrationCourse;
import com.endo4life.service.minio.MinioService;
import com.endo4life.web.rest.model.StatusUserProgressCourseDto;
import com.endo4life.web.rest.model.UserProgressCourseDto;
import org.apache.commons.lang3.StringUtils;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.Objects;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING)
public abstract class UserRegistrationCourseMapper {

    @Autowired
    protected MinioService minioService;

    @Value("${spring.application.minio-configuration.bucket-thumbnail:thumbnails}")
    protected String bucketThumbnail;

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "numberLecturesCompleted", source = "userRegistrationCourse.numberLecturesCompleted", qualifiedByName = "setNumberLecturesCompleted")
    @Mapping(target = "thumbnailUrl", source = "userRegistrationCourse", qualifiedByName = "thumbnailToUrl")
    public abstract UserProgressCourseDto toUserProgressCourseDto(UserRegistrationCourse userRegistrationCourse);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract StatusUserProgressCourseDto toStatusUserProgressCourseDto(
            UserRegistrationCourse userRegistrationCourse);

    @Named("setNumberLecturesCompleted")
    public Integer setNumberLecturesCompleted(Integer numberLecturesCompleted) {
        if (Objects.isNull(numberLecturesCompleted)) {
            return Constants.ZERO_INTEGER;
        }
        return numberLecturesCompleted;
    }

    @Named("thumbnailToUrl")
    public String thumbnailToUrl(UserRegistrationCourse userRegistrationCourse) {
        if (Objects.isNull(userRegistrationCourse) || Objects.isNull(userRegistrationCourse.getCourse())) {
            return null;
        }
        String thumbnail = userRegistrationCourse.getCourse().getThumbnail();
        if (StringUtils.isBlank(thumbnail)) {
            return null;
        }
        return minioService.createGetPreSignedLink(thumbnail, bucketThumbnail);
    }
}

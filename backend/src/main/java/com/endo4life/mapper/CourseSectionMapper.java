package com.endo4life.mapper;

import com.endo4life.constant.Constants;
import com.endo4life.domain.document.CourseSection;
import com.endo4life.service.minio.MinioService;
import com.endo4life.utils.JsonStringUtil;
import com.endo4life.web.rest.model.CourseSectionResponseDto;
import com.endo4life.web.rest.model.CreateCourseSectionRequestDto;
import com.endo4life.web.rest.model.CreateCourseSectionRequestDtoAttribute;
import com.endo4life.web.rest.model.LectureAndTestDto;
import com.endo4life.web.rest.model.ResponseDetailCourseSectionDto;
import com.endo4life.web.rest.model.UpdateCourseSectionRequestDto;
import org.apache.commons.lang3.StringUtils;
import org.mapstruct.AfterMapping;
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
public abstract class CourseSectionMapper {
    @Autowired
    private MinioService minioService;
    @Value("${spring.application.minio-configuration.bucket-thumbnail}")
    private String bucketThumbnail;
    @Value("${spring.application.minio-configuration.bucket-video}")
    private String bucketVideo;

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "tagsDetail", ignore = true)
    @Mapping(target = "attribute", ignore = true)
    public abstract CourseSection toCourseSection(CreateCourseSectionRequestDto courseSectionRequestDto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "tagsDetail", ignore = true)
    @Mapping(target = "attribute", source = "courseSection", qualifiedByName = "mapperIntoAttributeDto")
    public abstract ResponseDetailCourseSectionDto toResponseDetailCourseSectionDto(CourseSection courseSection);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "lastUpdated", source = "courseSection.updatedAt")
    @Mapping(target = "state", source = "courseSection.state")
    public abstract CourseSectionResponseDto toCourseSectionResponseDto(CourseSection courseSection);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "tagsDetail", ignore = true)
    @Mapping(target = "attachmentUrl", source = "courseSectionEntity.attachments", qualifiedByName = "setAttachmentUrl")
    @Mapping(target = "id", ignore = true)
    public abstract LectureAndTestDto toUserCourseSectionTestDto(CourseSection courseSectionEntity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "attribute", ignore = true)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "tagsDetail", ignore = true)
    public abstract void toCourseSection(@MappingTarget CourseSection courseSectionEntity,
            UpdateCourseSectionRequestDto updateCourseSectionRequestDto);

    @AfterMapping
    protected void updatelUrlsGetDetailCourseSection(
            @MappingTarget ResponseDetailCourseSectionDto responseDetailCourseSectionDto,
            CourseSection courseSectionEntity) {
        if (StringUtils.isNotBlank(courseSectionEntity.getThumbnail())) {
            responseDetailCourseSectionDto.setThumbnailUrl(
                    minioService.createGetPreSignedLink(courseSectionEntity.getThumbnail(), bucketThumbnail));
        }
        if (StringUtils.isNotBlank(courseSectionEntity.getAttachments())) {
            responseDetailCourseSectionDto.setAttachmentUrl(
                    minioService.createGetPreSignedLink(courseSectionEntity.getAttachments(), bucketVideo));
        }
    }

    @AfterMapping
    protected void updateUrlsGetPageCourseSection(@MappingTarget CourseSectionResponseDto courseSectionResponseDto,
            CourseSection courseSectionEntity) {
        if (StringUtils.isNotBlank(courseSectionEntity.getThumbnail())) {
            courseSectionResponseDto.setThumbnailUrl(
                    minioService.createGetPreSignedLink(courseSectionEntity.getThumbnail(), bucketThumbnail));
        }

    }

    @Named("mapperIntoAttributeDto")
    public CreateCourseSectionRequestDtoAttribute mapperIntoAttributeDto(CourseSection courseSection) {
        String attributeJsonString = courseSection.getAttribute();
        if (StringUtils.isBlank(attributeJsonString)) {
            return new CreateCourseSectionRequestDtoAttribute();
        }
        return JsonStringUtil.fromJsonString(attributeJsonString, CreateCourseSectionRequestDtoAttribute.class);
    }

    @Named("setAttachmentUrl")
    public String setAttachmentUrl(String attachment) {
        if (StringUtils.isBlank(attachment)) {
            return null;
        }
        return minioService.createGetPreSignedLink(attachment, bucketVideo);
    }
}

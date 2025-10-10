package com.endo4life.service.coursesection;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.endo4life.config.ApplicationProperties;
import com.endo4life.constant.Constants;
import com.endo4life.domain.document.Course;
import com.endo4life.domain.document.CourseSection;
import com.endo4life.mapper.CourseSectionMapper;
import com.endo4life.repository.CourseRepository;
import com.endo4life.repository.CourseSectionRepository;
import com.endo4life.repository.specifications.CourseSectionSpecification;
import com.endo4life.security.UserContextHolder;
import com.endo4life.service.minio.MinioService;
import com.endo4life.utils.StringUtil;
import com.endo4life.web.rest.errors.BadRequestException;
import com.endo4life.web.rest.model.CourseSectionCriteria;
import com.endo4life.web.rest.model.CourseSectionResponseDto;
import com.endo4life.web.rest.model.CreateCourseSectionRequestDto;
import com.endo4life.web.rest.model.CreateCourseSectionRequestDtoAttribute;
import com.endo4life.web.rest.model.ResponseDetailCourseSectionDto;
import com.endo4life.web.rest.model.UpdateCourseSectionRequestDto;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CourseSectionServiceImpl implements CourseSectionService {
    private final CourseSectionMapper courseSectionMapper;
    private final ObjectMapper objectMapper;
    private final MinioService minioService;
    private final CourseSectionRepository courseSectionRepository;
    private final CourseRepository courseRepository;
    private ApplicationProperties.MinioConfiguration minioConfig;
    private final ApplicationProperties applicationProperties;

    @PostConstruct
    private void init() {
        this.minioConfig = applicationProperties.minioConfiguration();
    }

    @Override
    public UUID createCourseSection(CreateCourseSectionRequestDto courseSectionRequestDto)
            throws JsonProcessingException {
        CourseSection courseSectionEntity = courseSectionMapper.toCourseSection(courseSectionRequestDto);
        Course courseEntity = courseRepository.findById(courseSectionRequestDto.getCourseId())
                .orElseThrow(() -> new BadRequestException(
                        "Course not found with id: " + courseSectionRequestDto.getCourseId()));

        courseSectionEntity.setCourse(courseEntity);
        courseSectionEntity.setTags(StringUtil.convertListToString(courseSectionRequestDto.getTags()));
        courseSectionEntity.setTagsDetail(StringUtil.convertListToString(courseSectionRequestDto.getTagsDetail()));

        if (Objects.nonNull(courseSectionRequestDto.getAttribute())) {
            courseSectionEntity.setAttribute(convertToJsonString(courseSectionRequestDto.getAttribute()));
        }

        courseSectionEntity.setCreatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        courseSectionEntity.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));

        Integer totalCourseSection = courseEntity.getTotalCourseSection();
        if (Objects.isNull(totalCourseSection)) {
            courseEntity.setTotalCourseSection(Constants.ONE);
        } else {
            courseEntity.setTotalCourseSection(courseEntity.getTotalCourseSection() + Constants.ONE);
        }

        courseRepository.save(courseEntity);
        courseSectionRepository.save(courseSectionEntity);
        return courseSectionEntity.getId();
    }

    @Override
    public ResponseDetailCourseSectionDto getCourseSectionById(UUID id) {
        CourseSection courseSectionEntity = courseSectionRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Course section not found with id: " + id));

        ResponseDetailCourseSectionDto detailCourseSectionDto = courseSectionMapper
                .toResponseDetailCourseSectionDto(courseSectionEntity);
        detailCourseSectionDto.setTags(StringUtil.convertStringToList(courseSectionEntity.getTags()));
        detailCourseSectionDto.setTagsDetail(StringUtil.convertStringToList(courseSectionEntity.getTagsDetail()));

        return detailCourseSectionDto;
    }

    @Override
    public Page<CourseSectionResponseDto> getCourseSections(CourseSectionCriteria criteria, Pageable pageable) {
        Page<CourseSectionResponseDto> courseSectionResponseDtos = courseSectionRepository
                .findAll(CourseSectionSpecification.byCriteria(criteria), pageable)
                .map(courseSectionMapper::toCourseSectionResponseDto);
        return new PageImpl<>(
                courseSectionResponseDtos.getContent(),
                pageable,
                courseSectionResponseDtos.getTotalElements());
    }

    @Override
    public UUID updateCourseSection(UUID id, UpdateCourseSectionRequestDto updateCourseSectionDto)
            throws JsonProcessingException {
        CourseSection courseSectionEntity = courseSectionRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Course section not found with id: " + id));

        courseSectionMapper.toCourseSection(courseSectionEntity, updateCourseSectionDto);

        if (Objects.nonNull(updateCourseSectionDto.getAttribute())) {
            courseSectionEntity.setAttribute(convertToJsonString(updateCourseSectionDto.getAttribute()));
        }

        if (CollectionUtils.isNotEmpty(updateCourseSectionDto.getTags())) {
            courseSectionEntity.setTags(StringUtil.convertListToString(updateCourseSectionDto.getTags()));
        }

        if (CollectionUtils.isNotEmpty(updateCourseSectionDto.getTagsDetail())) {
            courseSectionEntity.setTagsDetail(StringUtil.convertListToString(updateCourseSectionDto.getTagsDetail()));
        }

        UUID thumbnailDto = updateCourseSectionDto.getThumbnail();
        if (Objects.isNull(thumbnailDto) && StringUtils.isNotBlank(courseSectionEntity.getThumbnail())) {
            minioService.removeFile(courseSectionEntity.getThumbnail(), minioConfig.bucketThumbnail());
            courseSectionEntity.setThumbnail(null);
        }
        if (Objects.nonNull(thumbnailDto)) {
            if (!StringUtils.equalsIgnoreCase(courseSectionEntity.getThumbnail(), thumbnailDto.toString()) &&
                    StringUtils.isNotBlank(courseSectionEntity.getThumbnail())) {
                minioService.removeFile(courseSectionEntity.getThumbnail(), minioConfig.bucketThumbnail());
            }
            courseSectionEntity.setThumbnail(thumbnailDto.toString());
        }

        UUID attachmentDto = updateCourseSectionDto.getAttachments();
        if (Objects.isNull(attachmentDto) && StringUtils.isNotBlank(courseSectionEntity.getAttachments())) {
            minioService.removeFile(courseSectionEntity.getAttachments(), minioConfig.bucketVideo());
            courseSectionEntity.setAttachments(null);
        }
        if (Objects.nonNull(attachmentDto)) {
            if (!StringUtils.equalsIgnoreCase(courseSectionEntity.getAttachments(), attachmentDto.toString()) &&
                    StringUtils.isNotBlank(courseSectionEntity.getAttachments())) {
                minioService.removeFile(courseSectionEntity.getAttachments(), minioConfig.bucketVideo());
            }
            courseSectionEntity.setAttachments(attachmentDto.toString());
        }

        courseSectionEntity.setUpdatedAt(LocalDateTime.now());
        courseSectionEntity.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        courseSectionRepository.save(courseSectionEntity);
        return courseSectionEntity.getId();
    }

    @Override
    public void deleteCourseSection(UUID id) {
        CourseSection courseSectionEntity = courseSectionRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Course section not found with id: " + id));
        courseSectionRepository.delete(courseSectionEntity);
    }

    @Override
    public void deleteCourseSections(List<UUID> ids) {
        courseSectionRepository.deleteAllById(ids);
    }

    private String convertToJsonString(CreateCourseSectionRequestDtoAttribute attributeObj)
            throws JsonProcessingException {
        return objectMapper.writeValueAsString(attributeObj);
    }
}

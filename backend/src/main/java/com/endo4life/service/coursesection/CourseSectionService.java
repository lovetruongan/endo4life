package com.endo4life.service.coursesection;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.endo4life.web.rest.model.CourseSectionCriteria;
import com.endo4life.web.rest.model.CourseSectionResponseDto;
import com.endo4life.web.rest.model.CreateCourseSectionRequestDto;
import com.endo4life.web.rest.model.ResponseDetailCourseSectionDto;
import com.endo4life.web.rest.model.UpdateCourseSectionRequestDto;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface CourseSectionService {
    UUID createCourseSection(@Valid CreateCourseSectionRequestDto courseSectionRequestDto)
            throws JsonProcessingException;

    ResponseDetailCourseSectionDto getCourseSectionById(UUID id);

    Page<CourseSectionResponseDto> getCourseSections(CourseSectionCriteria criteria, Pageable pageable);

    UUID updateCourseSection(UUID id, UpdateCourseSectionRequestDto updateCourseSectionRequestDto)
            throws JsonProcessingException;

    void deleteCourseSection(UUID id);

    void deleteCourseSections(List<UUID> ids);
}

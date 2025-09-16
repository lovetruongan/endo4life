package com.endo4life.web.rest;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.endo4life.service.course.CourseService;
import com.endo4life.web.rest.api.CourseV1ApiDelegate;
import com.endo4life.web.rest.model.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class CourseV1ApiDelegateImpl implements CourseV1ApiDelegate {

    private final CourseService courseService;

    @Override
    public ResponseEntity<CourseResponsePaginatedDto> getCourses(CourseCriteria criteria, Pageable pageable) {
        Page<CourseResponseDto> page = courseService.getCourses(criteria, pageable);
        return ResponseEntity.ok(
                new CourseResponsePaginatedDto()
                        .data(page.getContent())
                        .total(page.getTotalElements()));
    }

    @Override
    public ResponseEntity<IdWrapperDto> createCourse(CreateCourseRequestDto course) {
        UUID id = courseService.createCourse(course);
        return ResponseEntity.status(HttpStatus.CREATED).body(new IdWrapperDto().id(id));
    }

    @Override
    public ResponseEntity<CourseDetailResponseDto> getCourseById(UUID id) {
        return ResponseEntity.ok(
                courseService.getCourseById(id));
    }

    @Override
    public ResponseEntity<CourseDetailResponseDto> updateCourse(UUID id,
            UpdateCourseRequestDto updateCourseRequestDto) {
        return ResponseEntity.ok(
                courseService.updateCourse(id, updateCourseRequestDto));
    }

    @Override
    public ResponseEntity<Void> deleteCourse(UUID id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
}

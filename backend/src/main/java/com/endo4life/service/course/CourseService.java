package com.endo4life.service.course;

import jakarta.validation.Valid;
import com.endo4life.web.rest.model.CourseCriteria;
import com.endo4life.web.rest.model.CourseResponseDto;
import com.endo4life.web.rest.model.CreateCourseRequestDto;
import com.endo4life.web.rest.model.CourseDetailResponseDto;
import com.endo4life.web.rest.model.UpdateCourseRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface CourseService {
    Page<CourseResponseDto> getCourses(CourseCriteria criteria, Pageable pageable);

    UUID createCourse(@Valid CreateCourseRequestDto courseRequestDto);

    CourseDetailResponseDto getCourseById(UUID id);

    CourseDetailResponseDto updateCourse(UUID id, UpdateCourseRequestDto updateCourseRequestDto);

    void deleteCourse(UUID id);

    void deleteCourses(List<UUID> ids);
}

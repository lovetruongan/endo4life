package com.endo4life.service.usercourse;

import com.endo4life.web.rest.model.CourseCriteria;
import com.endo4life.web.rest.model.StatusUserProgressCourseDto;
import com.endo4life.web.rest.model.UserCourseResponseDto;
import com.endo4life.web.rest.model.UserProgressCourseDto;
import com.endo4life.web.rest.model.UserResponseDetailCourseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface UserCourseService {
    Page<UserCourseResponseDto> getCourses(CourseCriteria criteria, Pageable pageable);

    UserResponseDetailCourseDto getUserCourseById(UUID id, UUID userInfoId);

    List<UserProgressCourseDto> getProgressCoursesUser(UUID userInfoId);

    StatusUserProgressCourseDto getStatusProgressCourseUser(UUID userInfoId, UUID courseId);
}

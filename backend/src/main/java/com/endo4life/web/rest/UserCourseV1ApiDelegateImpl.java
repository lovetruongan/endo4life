package com.endo4life.web.rest;

import com.endo4life.service.usercourse.UserCourseService;
import com.endo4life.web.rest.model.CourseCriteria;
import com.endo4life.web.rest.model.StatusUserProgressCourseDto;
import com.endo4life.web.rest.model.UserCourseResponseDto;
import com.endo4life.web.rest.model.UserCourseResponsePaginatedDto;
import com.endo4life.web.rest.model.UserProgressCourseDto;
import com.endo4life.web.rest.model.UserResponseDetailCourseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserCourseV1ApiDelegateImpl implements com.endo4life.web.rest.api.UserCourseV1ApiDelegate {
    private final UserCourseService userCourseService;

    @Override
    public ResponseEntity<UserCourseResponsePaginatedDto> getUserCourses(CourseCriteria criteria, Pageable pageable) {
        Page<UserCourseResponseDto> page = userCourseService.getCourses(criteria, pageable);
        return ResponseEntity.ok(
                new UserCourseResponsePaginatedDto()
                        .data(page.getContent())
                        .total(page.getTotalElements()));
    }

    @Override
    public ResponseEntity<UserResponseDetailCourseDto> getUserCourseById(UUID id, UUID userInfoId) {
        return ResponseEntity.ok(
                userCourseService.getUserCourseById(id, userInfoId));
    }

    @Override
    public ResponseEntity<List<UserProgressCourseDto>> getProgressCoursesUser(UUID userInfoId) {
        List<UserProgressCourseDto> list = userCourseService.getProgressCoursesUser(userInfoId);
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }

    @Override
    public ResponseEntity<StatusUserProgressCourseDto> getStatusProgressCourseUser(UUID userInfoId, UUID courseId) {
        return ResponseEntity.ok(
                userCourseService.getStatusProgressCourseUser(userInfoId, courseId));
    }
}

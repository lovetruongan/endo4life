package com.endo4life.web.rest;

import com.endo4life.security.RoleAccess;
import com.endo4life.service.userregistrationcourse.UserRegistrationCourseService;
import com.endo4life.web.rest.model.IdWrapperDto;
import com.endo4life.web.rest.model.UserInfoEnrollCourseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class EnrollCourseV1ApiDelegateImpl implements com.endo4life.web.rest.api.EnrollCourseV1ApiDelegate {
    private final UserRegistrationCourseService userRegistrationCourseService;

    @Override
    @RoleAccess.Authenticated // Any logged-in user can enroll
    public ResponseEntity<IdWrapperDto> enrollUserInCourse(UUID id, UserInfoEnrollCourseDto userInfoEnrollCourseDto) {
        UUID enrollID = userRegistrationCourseService.enrollUserIntoCourse(id, userInfoEnrollCourseDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(new IdWrapperDto().id(enrollID));
    }
}

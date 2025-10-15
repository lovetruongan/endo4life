package com.endo4life.service.userregistrationcourse;

import com.endo4life.web.rest.model.UserInfoEnrollCourseDto;

import java.util.UUID;

public interface UserRegistrationCourseService {
    UUID enrollUserIntoCourse(UUID courseId, UserInfoEnrollCourseDto userInfoEnrollCourseDto);
}

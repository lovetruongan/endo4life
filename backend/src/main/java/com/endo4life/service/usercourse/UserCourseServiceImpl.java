package com.endo4life.service.usercourse;

import com.endo4life.constant.Constants;
import com.endo4life.domain.document.Course;
import com.endo4life.domain.document.UserRegistrationCourse;
import com.endo4life.mapper.UserCourseMapper;
import com.endo4life.mapper.UserRegistrationCourseMapper;
import com.endo4life.repository.CourseRepository;
import com.endo4life.repository.UserRegistrationCourseRepository;
import com.endo4life.repository.specifications.CourseSpecifications;
import com.endo4life.utils.StringUtil;
import com.endo4life.web.rest.errors.BadRequestException;
import com.endo4life.web.rest.model.CourseCriteria;
import com.endo4life.web.rest.model.StatusUserProgressCourseDto;
import com.endo4life.web.rest.model.UserCourseResponseDto;
import com.endo4life.web.rest.model.UserProgressCourseDto;
import com.endo4life.web.rest.model.UserResponseDetailCourseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UserCourseServiceImpl implements UserCourseService {
    private final CourseRepository courseRepository;
    private final UserRegistrationCourseRepository userRegistrationCourseRepository;
    private final UserCourseMapper userCourseMapper;
    private final UserRegistrationCourseMapper userRegistrationCourseMapper;

    @Override
    public Page<UserCourseResponseDto> getCourses(CourseCriteria criteria, Pageable pageable) {
        Page<UserCourseResponseDto> userCourseResponseDtos = courseRepository
                .findAll(CourseSpecifications.byCriteriaAndState(criteria, Constants.PUBLIC_STATE), pageable)
                .map(userCourseMapper::toUserCourseResponseDto);
        return new PageImpl<>(
                userCourseResponseDtos.getContent(),
                pageable,
                userCourseResponseDtos.getTotalElements());
    }

    @Override
    public UserResponseDetailCourseDto getUserCourseById(UUID id, UUID userInfoId) {
        Course courseEntity = courseRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Course not found with id: " + id));

        UserResponseDetailCourseDto userResponseDetailCourseDto = userCourseMapper
                .toUserResponseDetailCourseDto(courseEntity);
        userResponseDetailCourseDto.setTags(StringUtil.convertStringToList(courseEntity.getTags()));
        userResponseDetailCourseDto.setTagsDetail(StringUtil.convertStringToList(courseEntity.getTagsDetail()));

        Optional<UserRegistrationCourse> userRegistrationCourseOpt = userRegistrationCourseRepository
                .findByCourseIdAndUserId(id, userInfoId);

        if (userRegistrationCourseOpt.isPresent()) {
            UserRegistrationCourse userRegistrationCourse = userRegistrationCourseOpt.get();
            userResponseDetailCourseDto.setIsEnrolledCourse(true);
            userResponseDetailCourseDto.setUserRegistrationCourseId(userRegistrationCourse.getId());
        } else {
            userResponseDetailCourseDto.setIsEnrolledCourse(false);
        }

        return userResponseDetailCourseDto;
    }

    @Override
    public List<UserProgressCourseDto> getProgressCoursesUser(UUID userInfoId) {
        List<UserRegistrationCourse> userRegistrationCourses = userRegistrationCourseRepository
                .findByUserId(userInfoId);
        return userRegistrationCourses.stream()
                .map(urc -> {
                    UserProgressCourseDto dto = userRegistrationCourseMapper.toUserProgressCourseDto(urc);
                    dto.setCourseId(urc.getCourse().getId());
                    dto.setCourseTitle(urc.getCourse().getTitle());
                    return dto;
                })
                .toList();
    }

    @Override
    public StatusUserProgressCourseDto getStatusProgressCourseUser(UUID userInfoId, UUID courseId) {
        UserRegistrationCourse userRegistrationCourse = userRegistrationCourseRepository
                .findByCourseIdAndUserId(courseId, userInfoId)
                .orElseThrow(() -> new BadRequestException("User not enrolled in course"));

        return userRegistrationCourseMapper.toStatusUserProgressCourseDto(userRegistrationCourse);
    }
}

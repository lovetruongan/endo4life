package com.endo4life.service.userregistrationcourse;

import com.endo4life.constant.Constants;
import com.endo4life.domain.document.Course;
import com.endo4life.domain.document.CourseSection;
import com.endo4life.domain.document.UserInfo;
import com.endo4life.domain.document.UserProgressCourseSection;
import com.endo4life.domain.document.UserRegistrationCourse;
import com.endo4life.repository.CourseRepository;
import com.endo4life.repository.UserInfoRepository;
import com.endo4life.repository.UserRegistrationCourseRepository;
import com.endo4life.security.UserContextHolder;
import com.endo4life.web.rest.errors.BadRequestException;
import com.endo4life.web.rest.model.UserInfoEnrollCourseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UserRegistrationCourseServiceImpl implements UserRegistrationCourseService {
    private final CourseRepository courseRepository;
    private final UserInfoRepository userInfoRepository;
    private final UserRegistrationCourseRepository userRegistrationCourseRepository;

    @Override
    public UUID enrollUserIntoCourse(UUID courseId, UserInfoEnrollCourseDto userInfoEnrollCourseDto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new BadRequestException("Course not found with id: " + courseId));

        UUID userInfoId = userInfoEnrollCourseDto.getUserInfoId();
        UserInfo userInfo = userInfoRepository.findById(userInfoId)
                .orElseThrow(() -> new BadRequestException("UserInfo not found with id: " + userInfoId));

        if (Objects.isNull(course.getRegistrationNumber())) {
            course.setRegistrationNumber(Constants.INITIALIZE_VIEW_COUNT);
        } else {
            course.setRegistrationNumber(course.getRegistrationNumber() + Constants.INITIALIZE_VIEW_COUNT);
        }

        courseRepository.save(course);
        UserRegistrationCourse userRegistrationCourseEntity = createUserRegistrationCourseEntity(course, userInfo);
        userRegistrationCourseEntity.setTotalLectures(course.getTotalCourseSection());
        processCreateUserProgressCourseSection(course, userRegistrationCourseEntity);
        userRegistrationCourseRepository.save(userRegistrationCourseEntity);
        return userRegistrationCourseEntity.getId();
    }

    private UserRegistrationCourse createUserRegistrationCourseEntity(Course course, UserInfo userInfo) {
        UserRegistrationCourse userRegistrationCourseEntity = UserRegistrationCourse
                .builder()
                .user(userInfo)
                .course(course)
                .build();
        userRegistrationCourseEntity.setCreatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        userRegistrationCourseEntity.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        return userRegistrationCourseEntity;
    }

    private void processCreateUserProgressCourseSection(Course course,
            UserRegistrationCourse userRegistrationCourseEntity) {
        List<CourseSection> listCourseSectionEntity = course.getCourseSections();
        if (CollectionUtils.isEmpty(listCourseSectionEntity)) {
            return;
        }

        List<UserProgressCourseSection> listUserProgressCourseSectionEntity = new ArrayList<>();
        for (CourseSection courseSection : listCourseSectionEntity) {
            UserProgressCourseSection userProgressCourseSection = UserProgressCourseSection
                    .builder()
                    .userRegistrationCourse(userRegistrationCourseEntity)
                    .courseSection(courseSection)
                    .totalSecondLectureVideo(courseSection.getVideoDuration())
                    .isCompletedCourseSection(false)
                    .isCompletedVideoCourseSection(false)
                    .isCompletedLectureReviewQuestion(false)
                    .build();
            userProgressCourseSection.setCreatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
            userProgressCourseSection.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
            listUserProgressCourseSectionEntity.add(userProgressCourseSection);
        }
        userRegistrationCourseEntity.setUserProgressCourseSections(listUserProgressCourseSectionEntity);
    }
}

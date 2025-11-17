package com.endo4life.service.course;

import com.endo4life.constant.Constants;
import com.endo4life.domain.document.Comment;
import com.endo4life.domain.document.Course;
import com.endo4life.domain.document.Test;
import com.endo4life.domain.document.UserRegistrationCourse;
import com.endo4life.mapper.CourseMapper;
import com.endo4life.repository.CommentRepository;
import com.endo4life.repository.CourseRepository;
import com.endo4life.repository.TestRepository;
import com.endo4life.repository.UserRegistrationCourseRepository;
import com.endo4life.repository.specifications.CourseSpecifications;
import com.endo4life.security.UserContextHolder;
import com.endo4life.utils.StringUtil;
import com.endo4life.web.rest.model.CourseCriteria;
import com.endo4life.web.rest.model.CourseDetailResponseDto;
import com.endo4life.web.rest.model.CourseResponseDto;
import com.endo4life.web.rest.model.CreateCourseRequestDto;
import com.endo4life.web.rest.model.UpdateCourseRequestDto;
import jakarta.validation.Valid;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
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
public class CourseServiceImpl implements CourseService {
    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;
    private final UserRegistrationCourseRepository userRegistrationCourseRepository;
    private final TestRepository testRepository;
    private final CommentRepository commentRepository;

    @Override
    public Page<CourseResponseDto> getCourses(CourseCriteria criteria, Pageable pageable) {
        Page<CourseResponseDto> courses = courseRepository
                .findAll(CourseSpecifications.byCriteria(criteria), pageable)
                .map(courseEntity -> {
                    CourseResponseDto courseResponseDto = courseMapper.toCourseResponseDto(courseEntity);
                    courseResponseDto.setTags(StringUtil.convertStringToList(courseEntity.getTags()));
                    courseResponseDto.setTagsDetail(StringUtil.convertStringToList(courseEntity.getTagsDetail()));
                    return courseResponseDto;
                });
        return new PageImpl<>(
                courses.getContent(),
                pageable,
                courses.getTotalElements());
    }

    @Override
    public UUID createCourse(@Valid CreateCourseRequestDto courseRequestDto) {
        Course course = courseMapper.toCourse(courseRequestDto);
        course.setTags(StringUtil.convertListToString(courseRequestDto.getTags()));
        course.setTagsDetail(StringUtil.convertListToString(courseRequestDto.getTagsDetail()));
        course.setCreatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        course.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        courseRepository.save(course);
        return course.getId();
    }

    @Override
    public CourseDetailResponseDto getCourseById(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Course not found with id: " + id));
        if (Objects.isNull(course.getViewNumber())) {
            course.setViewNumber(Constants.INITIALIZE_VIEW_COUNT);
        } else {
            course.setViewNumber(course.getViewNumber() + Constants.INITIALIZE_VIEW_COUNT);
        }
        courseRepository.save(course);
        CourseDetailResponseDto detailCourseDto = courseMapper.toCourseDetailResponseDto(course);
        detailCourseDto.setTags(StringUtil.convertStringToList(course.getTags()));
        detailCourseDto.setTagsDetail(StringUtil.convertStringToList(course.getTagsDetail()));
        return detailCourseDto;
    }

    @Override
    public CourseDetailResponseDto updateCourse(UUID id, UpdateCourseRequestDto updateCourseRequestDto) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Course not found with id: " + id));
        courseMapper.toCourse(course, updateCourseRequestDto);
        if (CollectionUtils.isNotEmpty(updateCourseRequestDto.getTags())) {
            course.setTags(StringUtil.convertListToString(updateCourseRequestDto.getTags()));
        }
        if (CollectionUtils.isNotEmpty(updateCourseRequestDto.getTagsDetail())) {
            course.setTagsDetail(StringUtil.convertListToString(updateCourseRequestDto.getTagsDetail()));
        }
        course.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        course.setUpdatedAt(LocalDateTime.now());

        courseRepository.save(course);
        return courseMapper.toCourseDetailResponseDto(course);
    }

    @Override
    public void deleteCourse(UUID id) {
        Course courseEntity = courseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Course not found with id: " + id));

        // Delete all comments for this course first
        List<Comment> comments = commentRepository.findByCourseId(id);
        if (!comments.isEmpty()) {
            commentRepository.deleteAll(comments);
            log.info("Deleted {} comments for course: {}", comments.size(), id);
        }

        // Delete all tests for this course (entrance tests, final exams, etc.)
        List<Test> tests = testRepository.findByCourseId(id);
        if (!tests.isEmpty()) {
            testRepository.deleteAll(tests);
            log.info("Deleted {} tests for course: {}", tests.size(), id);
        }

        // Delete all user registrations for this course
        List<UserRegistrationCourse> registrations = userRegistrationCourseRepository.findByCourseId(id);
        if (!registrations.isEmpty()) {
            userRegistrationCourseRepository.deleteAll(registrations);
            log.info("Deleted {} user registrations for course: {}", registrations.size(), id);
        }

        courseRepository.delete(courseEntity);
        log.info("Successfully deleted course: {}", id);
    }

    @Override
    public void deleteCourses(List<UUID> ids) {
        // Delete all related data for these courses
        for (UUID id : ids) {
            // Delete comments first
            List<Comment> comments = commentRepository.findByCourseId(id);
            if (!comments.isEmpty()) {
                commentRepository.deleteAll(comments);
                log.info("Deleted {} comments for course: {}", comments.size(), id);
            }

            // Delete tests
            List<Test> tests = testRepository.findByCourseId(id);
            if (!tests.isEmpty()) {
                testRepository.deleteAll(tests);
                log.info("Deleted {} tests for course: {}", tests.size(), id);
            }

            // Delete user registrations
            List<UserRegistrationCourse> registrations = userRegistrationCourseRepository.findByCourseId(id);
            if (!registrations.isEmpty()) {
                userRegistrationCourseRepository.deleteAll(registrations);
                log.info("Deleted {} user registrations for course: {}", registrations.size(), id);
            }
        }
        courseRepository.deleteAllById(ids);
        log.info("Successfully deleted {} courses", ids.size());
    }
}

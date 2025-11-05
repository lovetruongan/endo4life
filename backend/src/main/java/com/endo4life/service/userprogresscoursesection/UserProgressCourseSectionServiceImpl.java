package com.endo4life.service.userprogresscoursesection;

import com.endo4life.constant.Constants;
import com.endo4life.domain.document.CourseSection;
import com.endo4life.domain.document.Test;
import com.endo4life.domain.document.UserProgressCourseSection;
import com.endo4life.domain.document.UserRegistrationCourse;
import com.endo4life.mapper.CourseSectionMapper;
import com.endo4life.repository.UserProgressCourseSectionRepository;
import com.endo4life.repository.UserRegistrationCourseRepository;
import com.endo4life.utils.StringUtil;
import com.endo4life.web.rest.errors.BadRequestException;
import com.endo4life.web.rest.model.LectureAndTestDto;
import com.endo4life.web.rest.model.RecordDataUserCourseSectionDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UserProgressCourseSectionServiceImpl implements UserProgressCourseSectionService {
    private final CourseSectionMapper courseSectionMapper;
    private final UserRegistrationCourseRepository userRegistrationCourseRepository;
    private final UserProgressCourseSectionRepository userProgressCourseSectionRepository;

    @Override
    public UUID recordUserLectureData(UUID userProgressCourseSectionId,
            RecordDataUserCourseSectionDto recordDataUserCourseSectionDto) {
        UserProgressCourseSection userProgressCourseSection = userProgressCourseSectionRepository
                .findById(userProgressCourseSectionId)
                .orElseThrow(() -> new BadRequestException(
                        "UserProgressCourseSection not found with id: " + userProgressCourseSectionId));

        Integer totalTimeUserWatchedVideoInSecond = recordDataUserCourseSectionDto.getTotalTimeUserWatchedVideo();
        processUserProgressCourseSection(userProgressCourseSection, totalTimeUserWatchedVideoInSecond);
        userProgressCourseSectionRepository.save(userProgressCourseSection);

        // Recompute per-course aggregates
        UserRegistrationCourse registration = userProgressCourseSection.getUserRegistrationCourse();
        if (registration != null && registration.getUserProgressCourseSections() != null) {
            List<UserProgressCourseSection> sections = registration.getUserProgressCourseSections();
            int total = sections.size();
            int completed = (int) sections.stream()
                    .filter(s -> Boolean.TRUE.equals(s.getIsCompletedCourseSection()))
                    .count();
            registration.setTotalLectures(total);
            registration.setNumberLecturesCompleted(completed);
            registration.setIsCompletedTotalCourseSection(total > 0 && completed == total);
            userRegistrationCourseRepository.save(registration);
        }
        return userProgressCourseSection.getId();
    }

    @Override
    public List<LectureAndTestDto> getUserLecturesAndTest(UUID courseId, UUID userInfoId) {
        Optional<UserRegistrationCourse> userRegistrationCourseEntityOpt = userRegistrationCourseRepository
                .findByCourseIdAndUserId(courseId, userInfoId);
        if (userRegistrationCourseEntityOpt.isEmpty()) {
            throw new BadRequestException(
                    "User has not registered for the course to view the course lectures, please register for the course before viewing the course lectures!");
        }

        UserRegistrationCourse userRegistrationCourseEntity = userRegistrationCourseEntityOpt.get();
        List<UserProgressCourseSection> userProgressCourseSections = userRegistrationCourseEntity
                .getUserProgressCourseSections();
        return processLectureAndTestDto(userProgressCourseSections);
    }

    private List<LectureAndTestDto> processLectureAndTestDto(
            List<UserProgressCourseSection> userProgressCourseSections) {
        return userProgressCourseSections.stream().map(userProgressCourseSection -> {
            CourseSection courseSectionEntity = userProgressCourseSection.getCourseSection();
            LectureAndTestDto lectureAndTestDto = courseSectionMapper.toUserCourseSectionTestDto(courseSectionEntity);
            lectureAndTestDto.setId(userProgressCourseSection.getId());
            lectureAndTestDto.setIsCompletedCourseSection(userProgressCourseSection.getIsCompletedCourseSection());
            lectureAndTestDto.setIsCompletedLectureReviewQuestion(
                    userProgressCourseSection.getIsCompletedLectureReviewQuestion());
            lectureAndTestDto
                    .setIsCompletedVideoCourseSection(userProgressCourseSection.getIsCompletedVideoCourseSection());
            lectureAndTestDto.setCourseSectionId(userProgressCourseSection.getCourseSection().getId());

            if (Objects.nonNull(courseSectionEntity.getTest())) {
                Test testEntity = courseSectionEntity.getTest();
                if (CollectionUtils.isNotEmpty(testEntity.getQuestions())) {
                    lectureAndTestDto
                            .setTotalQuestionLectureReviewTest(courseSectionEntity.getTest().getQuestions().size());
                }
            }

            lectureAndTestDto.setTags(StringUtil.convertStringToList(courseSectionEntity.getTags()));
            lectureAndTestDto.setTagsDetail(StringUtil.convertStringToList(courseSectionEntity.getTagsDetail()));
            lectureAndTestDto.setVideoDuration(courseSectionEntity.getVideoDuration());
            return lectureAndTestDto;
        }).toList();
    }

    @NotNull
    private void processUserProgressCourseSection(UserProgressCourseSection userProgressCourseSection,
            Integer totalTimeUserWatchedVideoInSecond) {
        if (Boolean.TRUE.equals(userProgressCourseSection.getIsCompletedVideoCourseSection())) {
            return;
        }
        if (Objects.isNull(totalTimeUserWatchedVideoInSecond)) {
            return;
        }
        userProgressCourseSection.setTotalSecondWatchedLectureVideo(totalTimeUserWatchedVideoInSecond);
        calculateAndSetProgress(userProgressCourseSection);
    }

    private void calculateAndSetProgress(UserProgressCourseSection userProgressCourseSection) {
        Integer totalVideoDuration = userProgressCourseSection.getTotalSecondLectureVideo();
        Integer watched = userProgressCourseSection.getTotalSecondWatchedLectureVideo();

        // If duration is unknown, try to hydrate from course section or use a safe
        // fallback
        if (Objects.isNull(totalVideoDuration)) {
            Integer sectionDuration = Optional.ofNullable(userProgressCourseSection.getCourseSection())
                    .map(CourseSection::getVideoDuration)
                    .orElse(null);
            if (Objects.nonNull(sectionDuration)) {
                userProgressCourseSection.setTotalSecondLectureVideo(sectionDuration);
                totalVideoDuration = sectionDuration;
            } else {
                // Fallback: if user watched at least N seconds, mark as completed to avoid
                // blocking progress
                if (Objects.nonNull(watched) && watched >= Constants.MIN_WATCH_SECONDS_TO_COMPLETE_FALLBACK) {
                    userProgressCourseSection.setIsCompletedVideoCourseSection(true);
                    userProgressCourseSection.setPercentageVideoWatched(Constants.ONE_HUNDRED);
                    // With video considered done, also mark section completed when review is not
                    // required
                    boolean reviewDone = Boolean.TRUE
                            .equals(userProgressCourseSection.getIsCompletedLectureReviewQuestion());
                    boolean hasReview = Optional.ofNullable(userProgressCourseSection.getCourseSection())
                            .map(CourseSection::getTest)
                            .map(t -> t.getQuestions() != null && !t.getQuestions().isEmpty())
                            .orElse(false);
                    if (!hasReview || reviewDone) {
                        userProgressCourseSection.setIsCompletedCourseSection(true);
                    }
                }
                return;
            }
        }

        if (Objects.nonNull(totalVideoDuration) && totalVideoDuration > 0 && Objects.nonNull(watched)) {
            float percentageWatched = (watched * Constants.ONE_HUNDRED) / totalVideoDuration;
            userProgressCourseSection.setPercentageVideoWatched(percentageWatched);
            if (percentageWatched > Constants.COMPLETION_THRESHOLD) {
                userProgressCourseSection.setIsCompletedVideoCourseSection(true);
            }
        }

        // If video is completed, mark course section completed when review questions
        // are not required
        boolean videoDone = Boolean.TRUE.equals(userProgressCourseSection.getIsCompletedVideoCourseSection());
        boolean reviewDone = Boolean.TRUE
                .equals(userProgressCourseSection.getIsCompletedLectureReviewQuestion());
        boolean hasReview = Optional.ofNullable(userProgressCourseSection.getCourseSection())
                .map(CourseSection::getTest)
                .map(t -> t.getQuestions() != null && !t.getQuestions().isEmpty())
                .orElse(false);
        if (videoDone && (!hasReview || reviewDone)) {
            userProgressCourseSection.setIsCompletedCourseSection(true);
        }
    }
}

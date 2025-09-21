package com.endo4life.domain.document;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "user_progress_course_section")
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserProgressCourseSection extends AbstractEntity {

    @Column(name = "total_second_watched_lecture_video")
    private Integer totalSecondWatchedLectureVideo;

    @Column(name = "total_second_lecture_video")
    private Integer totalSecondLectureVideo;

    @Column(name = "percentage_video_watched")
    private Float percentageVideoWatched;

    @Column(name = "is_completed_video_course_section")
    private Boolean isCompletedVideoCourseSection;

    @Column(name = "is_completed_lecture_review_question")
    private Boolean isCompletedLectureReviewQuestion;

    @Column(name = "is_completed_course_section")
    private Boolean isCompletedCourseSection;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_registration_course_id", nullable = false)
    private UserRegistrationCourse userRegistrationCourse;

    @ManyToOne
    @JoinColumn(name = "course_section_id", nullable = false)
    private CourseSection courseSection;
}

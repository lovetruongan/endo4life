package com.endo4life.domain.document;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "user_registration_course")
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserRegistrationCourse extends AbstractEntity {

    @Column(name = "number_lectures_completed")
    private Integer numberLecturesCompleted;

    @Column(name = "total_lectures")
    private Integer totalLectures;

    @Column(name = "is_completed_entrance_test")
    private Boolean isCompletedEntranceTest;

    @Column(name = "is_completed_survey_course")
    private Boolean isCompletedSurveyCourse;

    @Column(name = "is_completed_total_course_section")
    private Boolean isCompletedTotalCourseSection;

    @Column(name = "is_completed_final_course_test")
    private Boolean isCompletedFinalCourseTest;

    @Column(name = "is_completed_course")
    private Boolean isCompletedCourse;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne
    @JoinColumn(name = "user_info_id", nullable = false)
    private UserInfo user;

    @OneToMany(mappedBy = "userRegistrationCourse", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<UserProgressCourseSection> userProgressCourseSections = new ArrayList<>();
}

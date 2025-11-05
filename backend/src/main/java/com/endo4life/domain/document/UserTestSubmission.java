package com.endo4life.domain.document;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@Table(name = "user_test_submission")
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserTestSubmission extends AbstractEntity {

    @ManyToOne
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;

    @ManyToOne
    @JoinColumn(name = "user_info_id", nullable = false)
    private UserInfo userInfo;

    @Column(name = "submitted_answers", columnDefinition = "text")
    private String submittedAnswers; // JSON string of submitted answers

    @Column(name = "score")
    private Integer score; // Score percentage (0-100)

    @Column(name = "correct_count")
    private Integer correctCount;

    @Column(name = "total_questions")
    private Integer totalQuestions;

    @Column(name = "passed")
    private Boolean passed;

    @Column(name = "attempt_number")
    private Integer attemptNumber;

    @Column(name = "grading_details", columnDefinition = "text")
    private String gradingDetails; // JSON string of detailed results for each question
}

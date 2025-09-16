package com.endo4life.domain.document;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "course_section")
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CourseSection extends AbstractEntity {

    @Column(name = "title", columnDefinition = "text")
    private String title;

    @Column(name = "tags", columnDefinition = "text")
    private String tags;

    @Column(name = "tags_detail", columnDefinition = "text")
    private String tagsDetail;

    @Column(name = "attachments")
    private String attachments;

    @Column(name = "thumbnail")
    private String thumbnail;

    @Column(name = "total_credits")
    private Integer totalCredits;

    @Column(name = "state")
    private String state;

    @Column(name = "attribute", columnDefinition = "text")
    private String attribute;

    @Column(name = "video_duration")
    private Integer videoDuration;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
}
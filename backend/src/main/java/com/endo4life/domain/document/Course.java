package com.endo4life.domain.document;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
@Table(name = "course")
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Course extends AbstractEntity {

    @Column(name = "state")
    private String state;

    @Column(name = "title", columnDefinition = "text")
    private String title;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "lecturer")
    private String lecturer;

    @Column(name = "point")
    private Double point;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "registration_number")
    private Integer registrationNumber;

    @Column(name = "view_number")
    private Integer viewNumber;

    @Column(name = "thumbnail")
    private String thumbnail;

    @Column(name = "tags", columnDefinition = "text")
    private String tags;

    @Column(name = "tags_detail", columnDefinition = "text")
    private String tagsDetail;

    @Column(name = "total_course_section")
    private Integer totalCourseSection;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<CourseSection> courseSections = new ArrayList<>();
}
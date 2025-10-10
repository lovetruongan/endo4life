package com.endo4life.repository.specifications;

import com.endo4life.domain.document.CourseSection;
import com.endo4life.domain.document.CourseSection_;
import com.endo4life.domain.document.Course_;
import com.endo4life.utils.StringUtil;
import com.endo4life.web.rest.model.CourseSectionCriteria;
import com.endo4life.web.rest.model.CourseState;
import lombok.experimental.UtilityClass;
import org.springframework.data.jpa.domain.Specification;

import java.util.Objects;
import java.util.UUID;

@UtilityClass
public class CourseSectionSpecification {
    public Specification<CourseSection> byCriteria(final CourseSectionCriteria criteria) {
        if (Objects.isNull(criteria)) {
            return Specification.where(null);
        }
        return Specification.where(
                byCourseId(criteria.getCourseId()))
                .and(
                        byState(criteria.getState()))
                .and(
                        byTitle(criteria.getTitle()));
    }

    private Specification<CourseSection> byCourseId(final UUID courseId) {
        if (Objects.isNull(courseId)) {
            return null;
        }
        return (root, query, builder) -> builder.equal(root.get(CourseSection_.course).get(Course_.id), courseId);
    }

    private Specification<CourseSection> byState(final CourseState courseState) {
        if (Objects.isNull(courseState)) {
            return null;
        }
        return (root, query, builder) -> builder.equal(
                root.get(CourseSection_.state), courseState.getValue());
    }

    private Specification<CourseSection> byTitle(final String title) {
        if (Objects.isNull(title)) {
            return null;
        }
        return ((root, query, criteriaBuilder) -> criteriaBuilder.like(
                criteriaBuilder.lower(
                        root.get(CourseSection_.title)),
                StringUtil.toContainParam(title)));
    }
}

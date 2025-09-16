package com.endo4life.repository.specifications;

import lombok.experimental.UtilityClass;
import com.endo4life.domain.document.Course;
import com.endo4life.domain.document.Course_;
import com.endo4life.utils.StringUtil;
import com.endo4life.web.rest.model.CourseCriteria;
import com.endo4life.web.rest.model.CourseState;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;

import java.util.Objects;

@UtilityClass
public class CourseSpecifications {
    public Specification<Course> byCriteria(final CourseCriteria criteria) {
        if (Objects.isNull(criteria)) {
            return Specification.where(null);
        }
        return Specification.where(
                byState(criteria.getState()))
                .and(
                        byTitle(criteria.getTitle()));
    }

    private Specification<Course> byState(final CourseState courseState) {
        if (Objects.isNull(courseState)) {
            return null;
        }
        return (root, query, builder) -> builder.equal(
                root.get(Course_.state), courseState.getValue());
    }

    private Specification<Course> byTitle(final String title) {
        if (Objects.isNull(title)) {
            return null;
        }
        return ((root, query, criteriaBuilder) -> criteriaBuilder.like(
                criteriaBuilder.lower(
                        root.get(Course_.title)),
                StringUtil.toContainParam(title)));
    }

    public Specification<Course> byCriteriaAndState(final CourseCriteria criteria,
            final String publicState) {
        return Specification.where(
                byStateValue(publicState))
                .and(byCriteria(criteria));
    }

    private Specification<Course> byStateValue(final String state) {
        if (StringUtils.isBlank(state)) {
            return null;
        }
        return (root, query, builder) -> builder.equal(
                root.get(Course_.state), state);
    }
}

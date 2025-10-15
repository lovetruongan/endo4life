package com.endo4life.repository.specifications;

import lombok.experimental.UtilityClass;
import com.endo4life.domain.document.Comment;
import com.endo4life.domain.document.Comment_;
import com.endo4life.domain.document.Course_;
import com.endo4life.domain.document.Resource_;
import com.endo4life.web.rest.model.CommentCriteria;
import org.springframework.data.jpa.domain.Specification;

import java.util.Objects;
import java.util.UUID;

@UtilityClass
public class CommentSpecifications {
    public Specification<Comment> byCriteria(CommentCriteria criteria) {
        if (Objects.isNull(criteria)) {
            return Specification.where(null);
        }
        return Specification.where(
                hasNoParentComment())
                .and(
                        hasResourceId(criteria.getResourceId()))
                .and(
                        hasCourseId(criteria.getCourseId()));
    }

    private Specification<Comment> hasResourceId(final UUID resourceId) {
        if (Objects.isNull(resourceId)) {
            return null;
        }
        return (root, query, builder) -> builder.equal(root.get(Comment_.resource).get(Resource_.id), resourceId);
    }

    private Specification<Comment> hasCourseId(final UUID courseId) {
        if (Objects.isNull(courseId)) {
            return null;
        }
        return (root, query, builder) -> builder.equal(root.get(Comment_.course).get(Course_.id), courseId);
    }

    private Specification<Comment> hasNoParentComment() {
        return (root, query, builder) -> builder.isNull(root.get(Comment_.parentComment));
    }
}

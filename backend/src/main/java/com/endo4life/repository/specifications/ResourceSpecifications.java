package com.endo4life.repository.specifications;

import lombok.experimental.UtilityClass;
import com.endo4life.domain.document.AbstractEntity_;
import com.endo4life.web.rest.model.ResourceCriteria;
import com.endo4life.web.rest.model.ResourceState;
import com.endo4life.web.rest.model.ResourceType;
import jakarta.persistence.metamodel.SingularAttribute;
import com.endo4life.domain.document.Resource;
import com.endo4life.domain.document.Resource_;
import com.endo4life.utils.StringUtil;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Objects;

@UtilityClass
public class ResourceSpecifications {

    public Specification<Resource> byCriteria(final ResourceCriteria criteria) {
        return Specification.where(hasResourceType(criteria.getType()))
                .and(isValid())
                .and(hasState(criteria.getState()))
                .and(bySearchWords(criteria.getTitle()));
    }

    private Specification<Resource> hasResourceType(final ResourceType resourceType) {
        if (Objects.isNull(resourceType)) {
            return null;
        }
        return (root, query, builder) -> builder.equal(root.get(Resource_.type), resourceType);
    }

    private Specification<Resource> hasState(final ResourceState state) {
        if (Objects.isNull(state)) {
            return null;
        }
        return (root, query, builder) -> builder.equal(root.get(Resource_.state), state);
    }

    private Specification<Resource> bySearchWords(final String arg) {
        if (StringUtils.isBlank(arg)) {
            return null;
        }
        return Specification.anyOf(
                byAttributeContain(Resource_.title, arg));
    }

    private Specification<Resource> byAttributeContain(
            final SingularAttribute<Resource, String> attribute, final String arg) {
        if (StringUtils.isBlank(arg)) {
            return null;
        }
        return (root, query, builder) -> builder.like(builder.lower(root.get(attribute)),
                StringUtil.toContainParam(arg));
    }

    private Specification<Resource> isValid() {
        return (root, query, builder) -> builder.and(
                builder.isNotNull(root.get(Resource_.type)),
                builder.isNotNull(root.get(Resource_.title)));
    }
}

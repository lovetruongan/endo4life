package com.endo4life.repository.specifications;

import com.endo4life.domain.document.Tag;
import com.endo4life.domain.document.Tag_;
import com.endo4life.web.rest.model.TagType;
import lombok.experimental.UtilityClass;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.UUID;

@UtilityClass
public class TagSpecifications {
    public Specification<Tag> byCriteria(List<UUID> parentId, TagType type) {
        return Specification
                .where(hasParentId(parentId))
                .and(hasType(type));
    }

    private Specification<Tag> hasParentId(List<UUID> args) {
        if (CollectionUtils.isEmpty(args)) {
            return (root, query, builder) -> builder.isNull(root.get(Tag_.parentId));
        }
        return (root, query, builder) -> root.get(Tag_.parentId).in(args);
    }

    private Specification<Tag> hasType(TagType arg) {
        if (arg == null) {
            return null;
        }
        return (root, query, builder) -> builder.equal(root.get(Tag_.type), arg);
    }
}

package com.endo4life.repository.specifications;

import com.endo4life.domain.document.UserInfo_;
import com.endo4life.domain.document.UserResource;
import com.endo4life.domain.document.UserResource_;
import com.endo4life.web.rest.model.UserResourceHistoryCriteria;
import com.endo4life.web.rest.model.UserResourceType;
import lombok.experimental.UtilityClass;
import org.springframework.data.jpa.domain.Specification;

import java.util.Objects;
import java.util.UUID;

@UtilityClass
public class UserResourceHistorySpecification {
    public Specification<UserResource> byCriteria(final UserResourceHistoryCriteria criteria) {
        if (Objects.isNull(criteria)) {
            return Specification.where(null);
        }
        return Specification.where(
                byUserInfoId(criteria.getUserInfoId()))
                .and(
                        byType(criteria.getType()));
    }

    private Specification<UserResource> byUserInfoId(final UUID userInfoId) {
        if (Objects.isNull(userInfoId)) {
            return null;
        }
        return (root, query, builder) -> builder.equal(root.get(UserResource_.userInfo).get(UserInfo_.id), userInfoId);
    }

    private Specification<UserResource> byType(final UserResourceType userResourceType) {
        if (Objects.isNull(userResourceType)) {
            return null;
        }
        return (root, query, builder) -> builder.equal(root.get(UserResource_.type), userResourceType.getValue());
    }
}

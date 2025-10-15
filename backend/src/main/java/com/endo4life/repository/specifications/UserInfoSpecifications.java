package com.endo4life.repository.specifications;

import lombok.experimental.UtilityClass;
import com.endo4life.domain.document.AbstractEntity_;
import com.endo4life.web.rest.model.UserInfoCriteria;
import com.endo4life.web.rest.model.UserInfoRole;
import com.endo4life.web.rest.model.UserInfoState;
import jakarta.persistence.metamodel.SingularAttribute;
import com.endo4life.domain.document.UserInfo;
import com.endo4life.domain.document.UserInfo_;
import com.endo4life.utils.StringUtil;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.Objects;

@UtilityClass
public class UserInfoSpecifications {

    public Specification<UserInfo> byCriteria(UserInfoCriteria criteria) {
        return Specification
                .where(bySearchWord(criteria.getSearchWord()))
                .and(byEmails(criteria.getEmails()))
                .and(byCreatedFrom(criteria.getFromDate()))
                .and(byCreatedTo(criteria.getToDate()))
                .and(hasRole(criteria.getRole()))
                .and(hasState(criteria.getState()))
                .and(byIsDeleted());
    }

    private Specification<UserInfo> byAttributeLike(
            final SingularAttribute<UserInfo, String> attribute, final String arg) {
        if (StringUtils.isBlank(arg)) {
            return null;
        }
        return (root, query, builder) -> builder.like(builder.lower(root.get(attribute)),
                StringUtil.toLikeParam(arg));
    }

    private Specification<UserInfo> byIsDeleted() {
        return (root, query, builder) -> builder.equal(root.get(UserInfo_.isDeleted),
                Boolean.FALSE);
    }

    private Specification<UserInfo> hasRole(UserInfoRole role) {
        if (Objects.isNull(role)) {
            return null;
        }
        return (root, query, builder) -> builder.equal(root.get(UserInfo_.role),
                UserInfo.UserInfoRole.valueOf(role.getValue()));
    }

    private Specification<UserInfo> hasState(UserInfoState state) {
        if (Objects.isNull(state)) {
            return null;
        }
        return (root, query, builder) -> builder.equal(root.get(UserInfo_.state),
                UserInfo.UserInfoState.valueOf(state.getValue()));
    }

    private Specification<UserInfo> bySearchWord(final String keyword) {
        if (StringUtils.isBlank(keyword)) {
            return null;
        }
        return Specification.anyOf(
                byAttributeLike(UserInfo_.email, keyword),
                byAttributeLike(UserInfo_.firstName, keyword),
                byAttributeLike(UserInfo_.lastName, keyword),
                byAttributeLike(UserInfo_.phoneNumber, keyword),
                byAttributeLike(UserInfo_.username, keyword));
    }

    private Specification<UserInfo> byEmails(final Collection<String> emails) {
        if (CollectionUtils.isEmpty(emails)) {
            return null;
        }
        return (root, query, builder) -> root.get(UserInfo_.email).in(emails);
    }

    private Specification<UserInfo> byCreatedFrom(final OffsetDateTime createdAt) {
        if (Objects.isNull(createdAt)) {
            return null;
        }
        return (root, query, builder) -> builder.greaterThanOrEqualTo(
                root.get(AbstractEntity_.createdAt),
                createdAt.toLocalDateTime());
    }

    private Specification<UserInfo> byCreatedTo(final OffsetDateTime createdAt) {
        if (Objects.isNull(createdAt)) {
            return null;
        }
        return (root, query, builder) -> builder.lessThanOrEqualTo(
                root.get(AbstractEntity_.createdAt),
                createdAt.toLocalDateTime());
    }
}

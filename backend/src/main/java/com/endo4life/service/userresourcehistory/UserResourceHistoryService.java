package com.endo4life.service.userresourcehistory;

import com.endo4life.web.rest.model.UserResourceHistoryCriteria;
import com.endo4life.web.rest.model.UserResourceType;
import com.endo4life.web.rest.model.UserResourcesAccessedResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserResourceHistoryService {
    UUID createUserResource(UUID userInfoId, UUID resourceId, UserResourceType userResourceType);

    Page<UserResourcesAccessedResponseDto> getResourcesByUserInfoIdAndType(UserResourceHistoryCriteria criteria,
            Pageable pageable);
}

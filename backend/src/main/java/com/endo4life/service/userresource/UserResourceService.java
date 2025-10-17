package com.endo4life.service.userresource;

import com.endo4life.web.rest.model.ResourceCriteria;
import com.endo4life.web.rest.model.UserResourceDetailResponseDto;
import com.endo4life.web.rest.model.UserResourceResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserResourceService {
    Page<UserResourceResponseDto> getUserResources(ResourceCriteria resourceCriteria, Pageable pageable);

    UserResourceDetailResponseDto getUserResourceById(UUID id);
}

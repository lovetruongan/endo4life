package com.endo4life.repository;

import com.endo4life.domain.document.UserResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserResourceHistoryRepository
        extends JpaRepository<UserResource, UUID>, JpaSpecificationExecutor<UserResource> {
}

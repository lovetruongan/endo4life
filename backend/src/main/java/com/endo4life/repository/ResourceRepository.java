package com.endo4life.repository;

import com.endo4life.domain.document.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID>, JpaSpecificationExecutor<Resource> {
    Optional<Resource> findResourceByPath(String path);

    @Query(value = "SELECT r.id, r.title, r.type, r.view_number, r.thumbnail FROM resource r WHERE r.state = 'PUBLIC' ORDER BY r.view_number DESC LIMIT :limit", nativeQuery = true)
    List<Object[]> findTopViewedResources(@Param("limit") int limit);

    @Query(value = "SELECT r.id, r.title, r.type, r.view_number, r.thumbnail FROM resource r WHERE r.state = 'PUBLIC' AND r.type = :type ORDER BY r.view_number DESC LIMIT :limit", nativeQuery = true)
    List<Object[]> findTopViewedResourcesByType(@Param("type") String type, @Param("limit") int limit);
}

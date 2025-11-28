package com.endo4life.repository;

import com.endo4life.domain.document.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID>, JpaSpecificationExecutor<Tag> {
    Optional<Tag> findByContent(String content);

    List<Tag> findAllByContent(String content);

    @Query("SELECT t.id from Tag t where t.parentId IN :parentIds")
    List<UUID> findAllIdsByParentIdIn(List<UUID> parentIds);
}

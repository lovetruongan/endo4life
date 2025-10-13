package com.endo4life.repository;

import com.endo4life.domain.document.DoctorUserConversations;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DoctorUserConversationRepository
        extends JpaRepository<DoctorUserConversations, UUID>, JpaSpecificationExecutor<DoctorUserConversations> {
    List<DoctorUserConversations> findByResourceIdAndParentIsNullOrderByCreatedAtDesc(UUID resourceId);

    List<DoctorUserConversations> findByParentId(UUID parentId);
}

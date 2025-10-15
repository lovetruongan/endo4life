package com.endo4life.repository;

import java.util.UUID;
import com.endo4life.domain.document.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID>,
        JpaSpecificationExecutor<Comment> {
}

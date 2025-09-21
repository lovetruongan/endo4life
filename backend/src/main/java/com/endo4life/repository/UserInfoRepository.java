package com.endo4life.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import com.endo4life.domain.document.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserInfoRepository extends JpaRepository<UserInfo, UUID>, JpaSpecificationExecutor<UserInfo> {

    Optional<UserInfo> findByUserId(UUID uuid);

    Optional<UserInfo> findByEmailIgnoreCase(String email);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    @Query("SELECT u FROM UserInfo u WHERE u.email IN :emails")
    List<UserInfo> findAllByEmails(@Param("emails") Set<String> emails);
}

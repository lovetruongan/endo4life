package com.endo4life.domain.document;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

@Getter
@Setter
@Entity
@Table(name = "user_info")
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserInfo extends AbstractEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "state")
    private UserInfoState state;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    private UserInfoRole role;

    @Column(name = "avatar_path")
    private String avatarPath;

    @Column(name = "certificate_path")
    private String certificatePath;

    @Column(name = "is_updated_profile")
    private Boolean isUpdatedProfile = Boolean.FALSE;

    @Column(name = "disabled_at")
    private LocalDateTime disabledAt;

    @Column(name = "is_deleted")
    private Boolean isDeleted = Boolean.FALSE;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<UserRegistrationCourse> userRegistrationCourses = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Certificate> certificates = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.isUpdatedProfile == null) {
            this.isUpdatedProfile = Boolean.FALSE;
        }
        if (this.isDeleted == null) {
            this.isDeleted = Boolean.FALSE;
        }
    }

    public void setCertificatePath(Set<String> certificatePaths) {
        if (CollectionUtils.isNotEmpty(certificatePaths)) {
            this.certificatePath = String.join(",", certificatePaths);
        }
    }

    public Set<String> getCertificatePath() {
        if (StringUtils.isBlank(this.certificatePath)) {
            return Set.of();
        }
        return Arrays.stream(this.certificatePath.split(",")).collect(Collectors.toSet());
    }

    // Enums
    public enum UserInfoState {
        ACTIVE("ACTIVE"),
        INACTIVE("INACTIVE"),
        PENDING("PENDING"),
        SUSPENDED("SUSPENDED");

        private final String value;

        UserInfoState(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static UserInfoState fromValue(String value) {
            for (UserInfoState state : UserInfoState.values()) {
                if (state.value.equals(value)) {
                    return state;
                }
            }
            throw new IllegalArgumentException("Unknown enum type " + value);
        }
    }

    public enum UserInfoRole {
        ADMIN("ADMIN"),
        SPECIALIST("SPECIALIST"),
        COORDINATOR("COORDINATOR"),
        CUSTOMER("CUSTOMER");

        private final String value;

        UserInfoRole(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static UserInfoRole fromValue(String value) {
            for (UserInfoRole role : UserInfoRole.values()) {
                if (role.value.equals(value)) {
                    return role;
                }
            }
            throw new IllegalArgumentException("Unknown enum type " + value);
        }
    }
}

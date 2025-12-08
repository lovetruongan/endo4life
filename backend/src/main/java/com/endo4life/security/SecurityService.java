package com.endo4life.security;

import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service for complex security checks that can be used with SpEL
 * in @PreAuthorize.
 * Usage: @PreAuthorize("@securityService.isOwner(#userId)")
 */
@Service("securityService")
public class SecurityService {

    /**
     * Check if current user is the owner of a resource
     */
    public boolean isOwner(UUID userId) {
        return UserContextHolder.getUserId()
                .map(currentUserId -> currentUserId.equals(userId.toString()))
                .orElse(false);
    }

    public boolean isOwner(String userId) {
        return UserContextHolder.getUserId()
                .map(currentUserId -> currentUserId.equals(userId))
                .orElse(false);
    }

    /**
     * Check if current user has a specific role
     */
    public boolean hasRole(String role) {
        return UserContextHolder.getUserContext()
                .map(ctx -> ctx.getAuthorities().stream()
                        .anyMatch(auth -> auth.getAuthority().equals(role)))
                .orElse(false);
    }

    /**
     * Check if current user is owner OR has admin role
     */
    public boolean isOwnerOrAdmin(UUID userId) {
        return hasRole(AuthoritiesConstants.ADMIN) || isOwner(userId);
    }

    public boolean isOwnerOrAdmin(String userId) {
        return hasRole(AuthoritiesConstants.ADMIN) || isOwner(userId);
    }

    /**
     * Check if current user is staff (ADMIN, SPECIALIST, or COORDINATOR)
     */
    public boolean isStaff() {
        return hasRole(AuthoritiesConstants.ADMIN)
                || hasRole(AuthoritiesConstants.SPECIALIST)
                || hasRole(AuthoritiesConstants.COORDINATOR);
    }

    /**
     * Check if current user can manage content (ADMIN or SPECIALIST)
     */
    public boolean canManageContent() {
        return hasRole(AuthoritiesConstants.ADMIN)
                || hasRole(AuthoritiesConstants.SPECIALIST);
    }
}

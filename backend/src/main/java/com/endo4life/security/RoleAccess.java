package com.endo4life.security;

import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Custom role-based access annotations for Endo4Life.
 * Use these instead of raw @PreAuthorize for cleaner, more maintainable code.
 */
public class RoleAccess {

    /**
     * Only ADMIN can access
     */
    @Target({ ElementType.METHOD, ElementType.TYPE })
    @Retention(RetentionPolicy.RUNTIME)
    @PreAuthorize("hasAuthority('ADMIN')")
    public @interface AdminOnly {
    }

    /**
     * Only SPECIALIST can access
     */
    @Target({ ElementType.METHOD, ElementType.TYPE })
    @Retention(RetentionPolicy.RUNTIME)
    @PreAuthorize("hasAuthority('SPECIALIST')")
    public @interface SpecialistOnly {
    }

    /**
     * Only COORDINATOR can access
     */
    @Target({ ElementType.METHOD, ElementType.TYPE })
    @Retention(RetentionPolicy.RUNTIME)
    @PreAuthorize("hasAuthority('COORDINATOR')")
    public @interface CoordinatorOnly {
    }

    /**
     * Only CUSTOMER can access
     */
    @Target({ ElementType.METHOD, ElementType.TYPE })
    @Retention(RetentionPolicy.RUNTIME)
    @PreAuthorize("hasAuthority('CUSTOMER')")
    public @interface CustomerOnly {
    }

    /**
     * ADMIN or SPECIALIST can access (e.g., content management)
     */
    @Target({ ElementType.METHOD, ElementType.TYPE })
    @Retention(RetentionPolicy.RUNTIME)
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SPECIALIST')")
    public @interface ContentManager {
    }

    /**
     * ADMIN or COORDINATOR can access (e.g., user management)
     */
    @Target({ ElementType.METHOD, ElementType.TYPE })
    @Retention(RetentionPolicy.RUNTIME)
    @PreAuthorize("hasAnyAuthority('ADMIN', 'COORDINATOR')")
    public @interface UserManager {
    }

    /**
     * Staff only (ADMIN, SPECIALIST, COORDINATOR)
     */
    @Target({ ElementType.METHOD, ElementType.TYPE })
    @Retention(RetentionPolicy.RUNTIME)
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SPECIALIST', 'COORDINATOR')")
    public @interface StaffOnly {
    }

    /**
     * Any authenticated user can access
     */
    @Target({ ElementType.METHOD, ElementType.TYPE })
    @Retention(RetentionPolicy.RUNTIME)
    @PreAuthorize("isAuthenticated()")
    public @interface Authenticated {
    }

    /**
     * Resource owner or ADMIN can access
     * Use with SpEL: @OwnerOrAdmin combined with method param check
     */
    @Target({ ElementType.METHOD, ElementType.TYPE })
    @Retention(RetentionPolicy.RUNTIME)
    @PreAuthorize("hasAuthority('ADMIN') or @securityService.isOwner(#userId)")
    public @interface OwnerOrAdmin {
    }
}

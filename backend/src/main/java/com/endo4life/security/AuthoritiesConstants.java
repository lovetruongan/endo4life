package com.endo4life.security;

import lombok.experimental.UtilityClass;

/**
 * Constants for Spring Security authorities for Endo4Life platform.
 */
@UtilityClass
public class AuthoritiesConstants {

    public static final String ADMIN = "ADMIN";

    public static final String SPECIALIST = "SPECIALIST";

    public static final String COORDINATOR = "COORDINATOR";

    public static final String CUSTOMER = "CUSTOMER";

    public static final String ANONYMOUS = "ANONYMOUS";
}

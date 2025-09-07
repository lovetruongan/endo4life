package com.endo4life.security;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

@Getter
@EqualsAndHashCode(of = "email", callSuper = false)
public class UserContext extends User {
    private final String email;
    private final String userId;
    private final String name;
    private final String sessionId;

    public UserContext(final String email,
            final String name,
            final String password,
            final String userId,
            final String sessionId,
            final Collection<? extends GrantedAuthority> authorities) {
        super(email, password, authorities);
        this.email = email;
        this.userId = userId;
        this.name = name;
        this.sessionId = sessionId;
    }
}

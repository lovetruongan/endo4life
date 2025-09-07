package com.endo4life.security;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import lombok.experimental.UtilityClass;
import com.endo4life.constant.Constants;

@UtilityClass
public class UserContextHolder {

    public void withAuthentication(final Authentication authentication) {
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    public void withSystem() {
        var principal = new UserContext(
                Constants.SYSTEM,
                Constants.SYSTEM,
                StringUtils.EMPTY,
                Constants.SYSTEM,
                StringUtils.EMPTY,
                List.of(new SimpleGrantedAuthority(Constants.SYSTEM)));
        var authentication = new UsernamePasswordAuthenticationToken(principal, StringUtils.EMPTY);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    public Optional<UserContext> getUserContext() {
        return Optional.ofNullable(SecurityContextHolder.getContext())
                .map(SecurityContext::getAuthentication)
                .map(Authentication::getPrincipal)
                .filter(UserContext.class::isInstance)
                .map(UserContext.class::cast);
    }

    public Optional<String> getName() {
        return getUserContext().map(UserContext::getName);
    }

    public Optional<String> getEmail() {
        return getUserContext().map(UserContext::getEmail);
    }

    public Optional<String> getUserId() {
        return getUserContext().map(UserContext::getUserId);
    }

    public String getAccessToken() {
        return Optional.ofNullable(SecurityContextHolder.getContext())
                .map(SecurityContext::getAuthentication)
                .map(Authentication::getCredentials)
                .map(Object::toString)
                .orElse(StringUtils.EMPTY);
    }

    public boolean isAuthenticated() {
        return getAuthorities().stream().noneMatch(AuthoritiesConstants.ANONYMOUS::equals);
    }

    public boolean hasAnyAuthorities(final String... authorities) {
        return CollectionUtils.containsAny(getAuthorities(), authorities);
    }

    public boolean hasAllAuthorities(final String... authorities) {
        return CollectionUtils.containsAll(getAuthorities(), Set.of(authorities));
    }

    private Set<String> getAuthorities() {
        return Optional.ofNullable(SecurityContextHolder.getContext())
                .map(SecurityContext::getAuthentication)
                .map(Authentication::getAuthorities)
                .orElse(Collections.emptyList())
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
    }
}

package com.endo4life.security;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import com.endo4life.config.ApplicationProperties;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class TokenProvider {
    private final ApplicationProperties applicationProperties;
    private final JwtParser jwtParser = Jwts.parserBuilder().build();
    private Set<String> validRoles;

    public TokenProvider(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
        validRoles = Set.of(
                AuthoritiesConstants.ADMIN.toLowerCase(),
                AuthoritiesConstants.SPECIALIST.toLowerCase(),
                AuthoritiesConstants.DOCTOR.toLowerCase(),
                AuthoritiesConstants.PATIENT.toLowerCase());
    }

    private boolean isValidRole(String role) {
        return validRoles.contains(role.toLowerCase());
    }

    public Authentication getAuthentication(String token) throws BadCredentialsException {
        int index = token.lastIndexOf(46);
        String ut = token.substring(0, index + 1);
        try {
            Claims claims = this.jwtParser.parseClaimsJwt(ut).getBody();
            ArrayList<GrantedAuthority> authorities = new ArrayList<>();

            List globalAuthorities;
            List clientAuthorities;

            var realmAcessMap = claims.get("realm_access", LinkedHashMap.class);
            if (Objects.nonNull(realmAcessMap)) {
                ArrayList<String> globalRoles = (ArrayList) realmAcessMap.getOrDefault("roles", List.of());
                if (!CollectionUtils.isEmpty(globalRoles)) {
                    globalAuthorities = globalRoles.stream()
                            .filter(this::isValidRole)
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());
                    authorities.addAll(globalAuthorities);
                }
            }

            String clientId = applicationProperties.keycloakConfiguration().clientId();
            String sessionId = claims.get("sid", String.class);
            Map<String, Object> resourceAccess = (Map<String, Object>) claims.get("resource_access");
            if (Objects.nonNull(resourceAccess)) {
                Map<String, Object> clientRoleMap = (Map<String, Object>) resourceAccess.getOrDefault(clientId,
                        new LinkedHashMap<>());
                List<String> clientRoles = (List<String>) clientRoleMap.getOrDefault("roles", List.of());
                if (!CollectionUtils.isEmpty(clientRoles)) {
                    clientAuthorities = clientRoles.stream()
                            .filter(this::isValidRole)
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());
                    authorities.addAll(clientAuthorities);
                }
            }
            User principal = new UserContext(
                    (String) claims.get("email"),
                    (String) claims.get("name"),
                    StringUtils.EMPTY,
                    claims.getSubject(),
                    sessionId,
                    authorities);

            return new UsernamePasswordAuthenticationToken(principal, token, authorities);
        } catch (ExpiredJwtException e) {
            throw new BadCredentialsException(e.toString());
        }
    }
}

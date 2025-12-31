package com.endo4life.controller;

import com.endo4life.security.UserContext;
import com.endo4life.security.UserContextHolder;
import org.springframework.context.annotation.Profile;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/test")
@Profile("dev")
public class TestAuthController {

    @GetMapping("/public")
    public Map<String, String> publicEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "This is a public endpoint");
        return response;
    }

    @GetMapping("/authenticated")
    public Map<String, Object> authenticatedEndpoint(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "You are authenticated!");

        UserContext userContext = UserContextHolder.getUserContext().orElse(null);
        if (userContext != null) {
            response.put("email", userContext.getEmail());
            response.put("name", userContext.getName());
            response.put("userId", userContext.getUserId());
            response.put("roles", authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList()));
        }

        return response;
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    public Map<String, String> adminEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "You have ADMIN role!");
        response.put("user", UserContextHolder.getEmail().orElse("unknown"));
        return response;
    }

    @GetMapping("/specialist")
    @PreAuthorize("hasAuthority('SPECIALIST')")
    public Map<String, String> specialistEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "You have SPECIALIST role!");
        return response;
    }

    @GetMapping("/debug/roles")
    public Map<String, Object> debugRoles(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("authorities", authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        response.put("principal", authentication.getPrincipal());
        return response;
    }

    @GetMapping("/debug/token")
    public Map<String, Object> debugToken(
            @org.springframework.web.bind.annotation.RequestHeader("Authorization") String authHeader) {
        Map<String, Object> response = new HashMap<>();

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            // Decode JWT without verification (for debugging only!)
            String[] chunks = token.split("\\.");
            if (chunks.length >= 2) {
                String payload = new String(java.util.Base64.getUrlDecoder().decode(chunks[1]));
                try {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    Map<String, Object> claims = mapper.readValue(payload, Map.class);
                    response.put("claims", claims);
                    response.put("realm_access", claims.get("realm_access"));
                    response.put("resource_access", claims.get("resource_access"));
                } catch (Exception e) {
                    response.put("error", "Failed to parse token: " + e.getMessage());
                }
            }
        }

        return response;
    }

    @GetMapping("/test-users")
    public Map<String, Object> testUsersEndpoint() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Direct test without going through the API delegate
            response.put("message", "Test endpoint working");
            response.put("user", UserContextHolder.getEmail().orElse("unknown"));
            response.put("authorities", UserContextHolder.getUserContext()
                    .map(u -> u.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .collect(Collectors.toList()))
                    .orElse(List.of()));
            return response;
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return response;
        }
    }
}

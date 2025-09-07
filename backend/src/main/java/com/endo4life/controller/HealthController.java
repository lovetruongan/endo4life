package com.endo4life.controller;

import com.endo4life.security.UserContextHolder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Slf4j
public class HealthController {

    @GetMapping("/public/health")
    public ResponseEntity<Map<String, Object>> publicHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "endo4life-backend",
                "timestamp", LocalDateTime.now(),
                "version", "1.0.0"));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> authenticatedHealth() {
        String userId = UserContextHolder.getUserId().orElse("unknown");
        String userEmail = UserContextHolder.getEmail().orElse("unknown");

        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "endo4life-backend",
                "timestamp", LocalDateTime.now(),
                "version", "1.0.0",
                "authenticated", true,
                "userId", userId,
                "userEmail", userEmail));
    }

    @GetMapping("/admin/health")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, Object>> adminHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "endo4life-backend",
                "timestamp", LocalDateTime.now(),
                "version", "1.0.0",
                "authenticated", true,
                "admin", true,
                "userId", UserContextHolder.getUserId().orElse("unknown"),
                "userEmail", UserContextHolder.getEmail().orElse("unknown")));
    }

    @GetMapping("/medical/health")
    @PreAuthorize("hasAnyAuthority('DOCTOR', 'SPECIALIST', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> medicalHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "endo4life-backend",
                "timestamp", LocalDateTime.now(),
                "version", "1.0.0",
                "authenticated", true,
                "medical", true,
                "userId", UserContextHolder.getUserId().orElse("unknown"),
                "userEmail", UserContextHolder.getEmail().orElse("unknown")));
    }

    @GetMapping("/patient/health")
    @PreAuthorize("hasAnyAuthority('PATIENT', 'DOCTOR', 'SPECIALIST', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> patientHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "endo4life-backend",
                "timestamp", LocalDateTime.now(),
                "version", "1.0.0",
                "authenticated", true,
                "patient", true,
                "userId", UserContextHolder.getUserId().orElse("unknown"),
                "userEmail", UserContextHolder.getEmail().orElse("unknown")));
    }
}

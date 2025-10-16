package com.endo4life.config;

import java.util.Optional;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import com.endo4life.constant.Constants;
import com.endo4life.security.UserContextHolder;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "springSecurityAuditorAware")
public class AuditingConfiguration {

    @Bean
    public AuditorAware<String> springSecurityAuditorAware() {
        return () -> Optional.of(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
    }
}

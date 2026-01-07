package com.endo4life.config;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@RequiredArgsConstructor
public class WebConfigurer {

    private final ApplicationProperties applicationProperties;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration cfg = applicationProperties.cors();
        if (cfg == null) {
            cfg = new CorsConfiguration();
            cfg.setAllowedOriginPatterns(List.of("*"));
            cfg.setAllowedMethods(List.of("*"));
            cfg.setAllowedHeaders(List.of("*"));
            cfg.setAllowCredentials(true);
        }
        // If credentials enabled and using wildcard origins, switch to patterns
        if (Boolean.TRUE.equals(cfg.getAllowCredentials()) 
                && cfg.getAllowedOrigins() != null 
                && cfg.getAllowedOrigins().contains("*")) {
            cfg.setAllowedOrigins(null);
            cfg.setAllowedOriginPatterns(List.of("*"));
        }
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return new CorsFilter(source);
    }
}

package com.endo4life.config;

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
            cfg = new CorsConfiguration().applyPermitDefaultValues();
        }
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return new CorsFilter(source);
    }
}

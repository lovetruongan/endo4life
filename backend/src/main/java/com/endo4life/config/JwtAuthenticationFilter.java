package com.endo4life.config;

import java.io.IOException;

import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.endo4life.security.TokenProvider;
import com.endo4life.security.UserContextHolder;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final TokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        var token = StringUtils.removeStart(request.getHeader(HttpHeaders.AUTHORIZATION), "Bearer ");
        if (StringUtils.isNotBlank(token)) {
            var authentication = tokenProvider.getAuthentication(token);
            log.info("Authentication Object: {}", authentication);
            UserContextHolder.withAuthentication(authentication);
        }
        filterChain.doFilter(request, response);
    }
}

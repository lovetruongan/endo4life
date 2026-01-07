package com.endo4life.web.rest;

import com.endo4life.web.rest.errors.BadRequestException;
import com.endo4life.web.rest.errors.UserNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.zalando.problem.ThrowableProblem;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequestException(BadRequestException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return buildResponse(ex.getClass().getSimpleName(), ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFoundException(UserNotFoundException ex) {
        log.warn("User not found: {}", ex.getMessage());
        return buildResponse(ex.getClass().getSimpleName(), ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return buildResponse(ex.getClass().getSimpleName(), ex.getMessage(), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(ThrowableProblem.class)
    public ResponseEntity<Map<String, Object>> handleThrowableProblem(ThrowableProblem ex) {
        log.warn("Problem: {}", ex.getMessage());
        HttpStatus status = ex.getStatus() != null 
            ? HttpStatus.valueOf(ex.getStatus().getStatusCode()) 
            : HttpStatus.BAD_REQUEST;
        return buildResponse(ex.getClass().getSimpleName(), ex.getMessage(), status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAllExceptions(Exception ex) {
        log.error("Unhandled exception: ", ex);
        return buildResponse(ex.getClass().getSimpleName(), ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<Map<String, Object>> buildResponse(String error, String message, HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", error);
        response.put("message", message);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.status(status).body(response);
    }
}

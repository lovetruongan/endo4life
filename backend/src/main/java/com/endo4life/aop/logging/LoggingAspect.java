package com.endo4life.aop.logging;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Objects;

/**
 * Aspect for logging execution of service and repository Spring components.
 */
@Aspect
@Component
public class LoggingAspect {

    /**
     * Pointcut that matches all repositories, services and Web REST endpoints.
     */
    @Pointcut("""
            within(@org.springframework.stereotype.Component *)
             || within(@org.springframework.stereotype.Repository *)
             || within(@org.springframework.stereotype.Service *)
             || within(@org.springframework.stereotype.Controller *)
             """)
    public void springBeanPointcut() {
        // Method is empty as this is just a Pointcut, the implementations are in the
        // advices.
    }

    /**
     * Pointcut that matches all Spring beans in the application's main packages.
     */
    @Pointcut("""
            within(com.endo4life.repository..*)
             || within(com.endo4life.service..*)
             || within(com.endo4life.web.rest..*)
            """)
    public void applicationPackagePointcut() {
        // Method is empty as this is just a Pointcut, the implementations are in the
        // advices.
    }

    /**
     * Advice that logs methods throwing exceptions.
     *
     * @param joinPoint join point for advice.
     * @param e         exception.
     */
    @AfterThrowing(pointcut = "applicationPackagePointcut() && springBeanPointcut()", throwing = "e")
    public void logAfterThrowing(final JoinPoint joinPoint, final Throwable e) {
        logger(joinPoint).error(
                "Exception in {}() with cause = '{}' and exception = '{}'",
                joinPoint.getSignature().getName(),
                Objects.isNull(e.getCause()) ? "NULL" : e.getCause(),
                e.getMessage(),
                e);
    }

    /**
     * Advice that logs when a method is entered and exited.
     *
     * @param joinPoint join point for advice.
     * @return result.
     * @throws Throwable throws {@link IllegalArgumentException}.
     */
    @Around("applicationPackagePointcut() && springBeanPointcut()")
    public Object logAround(final ProceedingJoinPoint joinPoint) throws Throwable {
        var log = logger(joinPoint);
        if (log.isDebugEnabled()) {
            log.debug(
                    "Enter: {}() with argument[s] = {}",
                    joinPoint.getSignature().getName(),
                    Arrays.toString(joinPoint.getArgs()));
        }
        try {
            var result = joinPoint.proceed();
            if (log.isDebugEnabled()) {
                log.debug(
                        "Exit: {}() with result = {}",
                        joinPoint.getSignature().getName(),
                        result);
            }
            return result;
        } catch (final IllegalArgumentException e) {
            log.error(
                    "Illegal argument: {} in {}()",
                    Arrays.toString(joinPoint.getArgs()),
                    joinPoint.getSignature().getName());
            throw e;
        }
    }

    /**
     * Retrieves the {@link Logger} associated to the given {@link JoinPoint}.
     *
     * @param joinPoint join point we want the logger for.
     * @return {@link Logger} associated to the given {@link JoinPoint}.
     */
    private Logger logger(final JoinPoint joinPoint) {
        return LoggerFactory.getLogger(joinPoint.getSignature().getDeclaringTypeName());
    }
}

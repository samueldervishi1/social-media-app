package com.chattr.server.aspects;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Aspect for logging execution of service and controller layer methods.
 * Excludes utility classes like JwtAuthenticationFilter from logging.
 */
@Aspect
@Component
@Slf4j
public class LoggingAspect {

    /**
     * Pointcut that matches all classes within com.chattr.server package,
     * excluding JwtAuthenticationFilter to avoid noisy logs.
     */
    @Pointcut("within(com.chattr.server..*) && !within(com.chattr.server.utils.JwtAuthenticationFilter)")
    public void applicationPackagePointcut() {
        // This method defines the pointcut, it remains empty.
    }

    /**
     * Logs entry, exit, and exceptions of all matched methods.
     *
     * @param joinPoint the join point representing the method
     * @return the result of the method execution
     * @throws Throwable if the underlying method throws any exception
     */
    @Around("applicationPackagePointcut()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        String method = joinPoint.getSignature().toShortString();
        Object[] args = joinPoint.getArgs();

        log.info("Entering {} with arguments: {}", method, Arrays.toString(args));
        long startTime = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - startTime;

            log.info("Exiting {} with result: {} ({} ms)", method, result, duration);
            return result;
        } catch (Throwable ex) {
            long duration = System.currentTimeMillis() - startTime;

            log.error("Exception in {} with cause = {} ({} ms)",
                    method,
                    ex.getCause() != null ? ex.getCause() : ex.getMessage(),
                    duration);

            throw ex;
        }
    }
}
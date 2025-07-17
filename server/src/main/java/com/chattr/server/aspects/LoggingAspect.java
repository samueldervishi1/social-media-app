package com.chattr.server.aspects;

import java.util.Arrays;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

/**
 * Aspect for logging execution of service and controller layer methods.
 * Excludes utility classes and performance-critical methods from logging.
 */
@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Pointcut("within(com.chattr.server..*) && " + "!within(com.chattr.server.utils.JwtAuthenticationFilter) && "
            + "!within(com.chattr.server.utils.JwtTokenUtil) && "
            + "!execution(* com.chattr.server.services.*.findAndValidateUser(..)) && "
            + "!execution(* com.chattr.server.services.*.verifyPassword(..))")
    public void applicationPackagePointcut() {
    }

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

            log.error("Exception in {} with cause = {} ({} ms)", method,
                    ex.getCause() != null ? ex.getCause() : ex.getMessage(), duration);

            throw ex;
        }
    }
}

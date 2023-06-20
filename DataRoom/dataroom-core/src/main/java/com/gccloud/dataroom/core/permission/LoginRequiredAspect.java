package com.gccloud.dataroom.core.permission;

import com.gccloud.common.exception.GlobalException;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.util.Objects;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/5/15 10:51
 */
@Slf4j
@Aspect
@Component
public class LoginRequiredAspect {
    @Resource
    private PermissionClient tokenClient;

    @Before("@annotation(loginRequired) || @within(loginRequired)")
    public void doBefore(JoinPoint joinPoint, ScreenPermission loginRequired) {
        // 获取request
        HttpServletRequest request = ((ServletRequestAttributes) Objects.requireNonNull(RequestContextHolder.getRequestAttributes())).getRequest();
        // 判断方法所属的类是否标记了该注解
        Class<?> targetClass = joinPoint.getTarget().getClass();
        ScreenPermission classAnnotation = targetClass.getAnnotation(ScreenPermission.class);
        boolean classRequired = (classAnnotation != null && classAnnotation.required());
        // 判断方法是否标记了该注解
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        ScreenPermission methodAnnotation = method.getAnnotation(ScreenPermission.class);
        boolean methodRequired = (methodAnnotation != null && methodAnnotation.required());
        // 判断是否需要登录权限，就近原则，方法上有优先方法上的，方法上没有则使用类上的
        boolean required = methodRequired || classRequired;
        if (required) {
            // 获取权限
            String[] permissions = methodAnnotation != null ? methodAnnotation.permissions() : classAnnotation.permissions();
            // 校验token
            boolean verify = tokenClient.verifyApiPermission(request, permissions);
            if (!verify) {
                throw new GlobalException("请求权限不足");
            }
        }
    }

    @AfterThrowing(pointcut = "@annotation(loginRequired) || @within(loginRequired)")
    public void doAfterThrowing(JoinPoint joinPoint, ScreenPermission loginRequired) {
        // 记录日志等操作
    }
}

package com.gccloud.dataroom.core.permission;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/5/15 10:51
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ScreenPermission {

    boolean required() default true;

    String[] permissions() default {};
}

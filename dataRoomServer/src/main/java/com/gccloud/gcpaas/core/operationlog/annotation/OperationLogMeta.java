package com.gccloud.gcpaas.core.operationlog.annotation;

import com.gccloud.gcpaas.core.operationlog.model.OperationLogDetailLevel;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface OperationLogMeta {

    String targetType() default "";

    String actionType() default "";

    String actionDesc() default "";

    String businessType() default "";

    String businessName() default "";

    String businessDesc() default "";

    String targetIdKey() default "";

    String targetNameKey() default "";

    OperationLogDetailLevel detailLevel() default OperationLogDetailLevel.DEFAULT;
}

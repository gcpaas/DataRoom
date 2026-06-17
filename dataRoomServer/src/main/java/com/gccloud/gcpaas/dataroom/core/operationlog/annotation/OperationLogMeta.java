package com.gccloud.gcpaas.dataroom.core.operationlog.annotation;

import com.gccloud.gcpaas.dataroom.core.operationlog.model.OperationLogDetailLevel;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface OperationLogMeta {

    /**
     * 操作对象类型，用于标识被操作资源的类别，例如页面、数据集、数据源等。
     * <p>
     * 类级注解可作为该控制器下所有接口的默认值，方法级注解会覆盖类级配置；为空时按请求路径推断。
     */
    String targetType() default "";

    /**
     * 操作类型，用于标识本次操作的动作，例如新增、修改、删除、查询、发布等。
     * <p>
     * 为空时按请求路径和方法名推断。
     */
    String actionType() default "";

    /**
     * 操作描述，用于记录更具体的操作说明。
     * <p>
     * 为空时默认使用解析后的操作类型。
     */
    String actionDesc() default "";

    /**
     * 业务类型，用于对操作日志进行业务域归类，例如页面管理、数据集运行、认证登录等。
     * <p>
     * 类级注解可作为默认业务类型，方法级注解会覆盖类级配置；为空时按请求路径推断。
     */
    String businessType() default "";

    /**
     * 业务名称，用于展示业务域的中文名称，例如页面管理、数据源管理、素材上传等。
     * <p>
     * 类级注解可作为默认业务名称，方法级注解会覆盖类级配置；为空时按请求路径推断。
     */
    String businessName() default "";

    /**
     * 业务描述，用于补充说明当前业务场景。
     */
    String businessDesc() default "";

    /**
     * 目标标识提取字段名，用于从路径变量、请求参数或请求体中提取被操作对象 ID。
     * <p>
     * 为空时按内置字段优先级提取，例如 id、code、pageCode、datasetCode 等。
     */
    String targetIdKey() default "";

    /**
     * 目标名称提取字段名，用于从路径变量、请求参数或请求体中提取被操作对象名称。
     * <p>
     * 为空时按内置字段优先级提取，例如 name、pageName、datasetName、resourceName、username 等。
     */
    String targetNameKey() default "";

    /**
     * 日志明细级别，用于控制记录完整请求响应信息或仅记录摘要信息。
     * <p>
     * 默认值表示由解析器按请求路径推断。
     */
    OperationLogDetailLevel detailLevel() default OperationLogDetailLevel.DEFAULT;
}

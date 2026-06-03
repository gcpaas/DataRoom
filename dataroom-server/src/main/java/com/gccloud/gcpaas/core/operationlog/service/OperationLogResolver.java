package com.gccloud.gcpaas.core.operationlog.service;

import com.gccloud.gcpaas.core.operationlog.annotation.OperationLogMeta;
import com.gccloud.gcpaas.core.operationlog.model.OperationLogContext;
import com.gccloud.gcpaas.core.operationlog.model.OperationLogDetailLevel;
import com.gccloud.gcpaas.core.operationlog.model.OperationLogResolvedMeta;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.PropertyAccessorFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerMapping;

import java.lang.reflect.Method;
import java.util.*;

@Slf4j
public class OperationLogResolver {

    private static final List<String> TARGET_ID_KEYS = List.of(
            "id", "code", "pageCode", "datasetCode", "dataSourceCode", "resourceId", "userId"
    );

    private static final List<String> TARGET_NAME_KEYS = List.of(
            "name", "pageName", "datasetName", "resourceName", "username"
    );

    public OperationLogResolvedMeta resolve(HttpServletRequest request, HandlerMethod handlerMethod, Map<String, Object> requestBody) {
        OperationLogResolvedMeta resolvedMeta = new OperationLogResolvedMeta();
        String uri = normalizeUri(request);
        OperationLogMeta classMeta = AnnotatedElementUtils.findMergedAnnotation(handlerMethod.getBeanType(), OperationLogMeta.class);
        OperationLogMeta methodMeta = AnnotatedElementUtils.findMergedAnnotation(handlerMethod.getMethod(), OperationLogMeta.class);

        applyBaseRules(resolvedMeta, uri);
        applyAnnotation(resolvedMeta, classMeta);
        applyMethodRules(resolvedMeta, uri, handlerMethod.getMethod());
        applyAnnotation(resolvedMeta, methodMeta);

        Map<String, Object> candidates = new LinkedHashMap<>();
        Object pathVars = request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        if (pathVars instanceof Map<?, ?> pathVarMap) {
            pathVarMap.forEach((key, value) -> candidates.put(String.valueOf(key), value));
        }
        Enumeration<String> parameterNames = request.getParameterNames();
        while (parameterNames.hasMoreElements()) {
            String name = parameterNames.nextElement();
            String value = request.getParameter(name);
            if (StringUtils.isNotBlank(value)) {
                candidates.putIfAbsent(name, value);
            }
        }
        if (requestBody != null) {
            candidates.putAll(requestBody);
        }

        resolvedMeta.setTargetId(extractValue(candidates, StringUtils.defaultIfBlank(resolvedMeta.getTargetIdKey(), null), TARGET_ID_KEYS));
        resolvedMeta.setTargetName(extractValue(candidates, StringUtils.defaultIfBlank(resolvedMeta.getTargetNameKey(), null), TARGET_NAME_KEYS));
        if (resolvedMeta.getDetailLevel() == OperationLogDetailLevel.DEFAULT) {
            resolvedMeta.setDetailLevel(inferDetailLevel(uri));
        }
        return resolvedMeta;
    }

    public void fillTargetFields(OperationLogContext context, HttpServletRequest request, Map<String, Object> requestBody) {
        Map<String, Object> candidates = new LinkedHashMap<>();
        Object pathVars = request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        if (pathVars instanceof Map<?, ?> pathVarMap) {
            pathVarMap.forEach((key, value) -> candidates.put(String.valueOf(key), value));
        }
        Enumeration<String> parameterNames = request.getParameterNames();
        while (parameterNames.hasMoreElements()) {
            String name = parameterNames.nextElement();
            String value = request.getParameter(name);
            if (StringUtils.isNotBlank(value)) {
                candidates.putIfAbsent(name, value);
            }
        }
        if (requestBody != null) {
            candidates.putAll(requestBody);
        }
        if (StringUtils.isBlank(context.getTargetId())) {
            context.setTargetId(extractValue(candidates, StringUtils.defaultIfBlank(context.getTargetIdKey(), null), TARGET_ID_KEYS));
        }
        if (StringUtils.isBlank(context.getTargetName())) {
            context.setTargetName(extractValue(candidates, StringUtils.defaultIfBlank(context.getTargetNameKey(), null), TARGET_NAME_KEYS));
        }
    }

    public String normalizeUri(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (StringUtils.isNotBlank(contextPath) && uri.startsWith(contextPath)) {
            uri = uri.substring(contextPath.length());
        }
        return uri;
    }

    private void applyBaseRules(OperationLogResolvedMeta resolvedMeta, String uri) {
        if (uri.startsWith("/dataRoom/page")) {
            resolvedMeta.setTargetType("page");
            resolvedMeta.setBusinessType("page_manage");
            resolvedMeta.setBusinessName("页面管理");
        } else if (uri.startsWith("/dataRoom/dataset")) {
            resolvedMeta.setTargetType("dataset");
            resolvedMeta.setBusinessType("dataset_manage");
            resolvedMeta.setBusinessName("数据集管理");
        } else if (uri.startsWith("/dataRoom/dataSource/excel")) {
            resolvedMeta.setTargetType("datasource");
            resolvedMeta.setBusinessType("excel_datasource_manage");
            resolvedMeta.setBusinessName("Excel数据源管理");
        } else if (uri.startsWith("/dataRoom/dataSource")) {
            resolvedMeta.setTargetType("datasource");
            resolvedMeta.setBusinessType("datasource_manage");
            resolvedMeta.setBusinessName("数据源管理");
        } else if (uri.startsWith("/dataRoom/resource")) {
            resolvedMeta.setTargetType("resource");
            resolvedMeta.setBusinessType("resource_manage");
            resolvedMeta.setBusinessName("素材管理");
        } else if (uri.startsWith("/dataRoom/map")) {
            resolvedMeta.setTargetType("map");
            resolvedMeta.setBusinessType("map_manage");
            resolvedMeta.setBusinessName("地图管理");
        } else if (uri.startsWith("/dataRoom/user")) {
            resolvedMeta.setTargetType("user");
            resolvedMeta.setBusinessType("user_manage");
            resolvedMeta.setBusinessName("用户管理");
        } else if (uri.startsWith("/dataRoom/captcha")) {
            resolvedMeta.setTargetType("captcha");
            resolvedMeta.setBusinessType("captcha");
            resolvedMeta.setBusinessName("验证码");
        }
        resolvedMeta.setDetailLevel(inferDetailLevel(uri));
    }

    private void applyMethodRules(OperationLogResolvedMeta resolvedMeta, String uri, Method method) {
        String action = inferAction(uri, method.getName());
        resolvedMeta.setActionType(action);
        if (StringUtils.isBlank(resolvedMeta.getActionDesc())) {
            resolvedMeta.setActionDesc(action);
        }
    }

    private void applyAnnotation(OperationLogResolvedMeta resolvedMeta, OperationLogMeta meta) {
        if (meta == null) {
            return;
        }
        if (StringUtils.isNotBlank(meta.targetType())) {
            resolvedMeta.setTargetType(meta.targetType());
        }
        if (StringUtils.isNotBlank(meta.actionType())) {
            resolvedMeta.setActionType(meta.actionType());
        }
        if (StringUtils.isNotBlank(meta.actionDesc())) {
            resolvedMeta.setActionDesc(meta.actionDesc());
        }
        if (StringUtils.isNotBlank(meta.businessType())) {
            resolvedMeta.setBusinessType(meta.businessType());
        }
        if (StringUtils.isNotBlank(meta.businessName())) {
            resolvedMeta.setBusinessName(meta.businessName());
        }
        if (StringUtils.isNotBlank(meta.businessDesc())) {
            resolvedMeta.setBusinessDesc(meta.businessDesc());
        }
        if (StringUtils.isNotBlank(meta.targetIdKey())) {
            resolvedMeta.setTargetIdKey(meta.targetIdKey());
        }
        if (StringUtils.isNotBlank(meta.targetNameKey())) {
            resolvedMeta.setTargetNameKey(meta.targetNameKey());
        }
        if (meta.detailLevel() != OperationLogDetailLevel.DEFAULT) {
            resolvedMeta.setDetailLevel(meta.detailLevel());
        }
    }

    private String extractValue(Map<String, Object> candidates, String preferredKey, List<String> fallbackKeys) {
        if (StringUtils.isNotBlank(preferredKey) && candidates.get(preferredKey) != null) {
            return unwrapValue(candidates.get(preferredKey));
        }
        for (String fallbackKey : fallbackKeys) {
            Object value = candidates.get(fallbackKey);
            String unwrapped = unwrapValue(value);
            if (StringUtils.isNotBlank(unwrapped)) {
                return unwrapped;
            }
        }
        return null;
    }

    private String unwrapValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Map<?, ?> map) {
            Object nested = map.get("code");
            if (nested == null) {
                nested = map.get("id");
            }
            if (nested == null) {
                nested = map.get("name");
            }
            return nested == null ? null : String.valueOf(nested);
        }
        if (!(value instanceof CharSequence) && !(value instanceof Number) && !(value instanceof UUID)) {
            try {
                BeanWrapper beanWrapper = PropertyAccessorFactory.forBeanPropertyAccess(value);
                for (String field : List.of("code", "id", "name")) {
                    if (beanWrapper.isReadableProperty(field)) {
                        Object nested = beanWrapper.getPropertyValue(field);
                        if (nested != null) {
                            return String.valueOf(nested);
                        }
                    }
                }
            } catch (Exception ignored) {
                log.error(ExceptionUtils.getStackTrace(ignored));
                return String.valueOf(value);
            }
        }
        return String.valueOf(value);
    }

    private String inferAction(String uri, String methodName) {
        String normalized = uri.toLowerCase();
        if (normalized.contains("/publish")) {
            return "发布";
        }
        if (normalized.contains("/offline")) {
            return "下线";
        }
        if (normalized.contains("/upload")) {
            return "上传";
        }
        if (normalized.contains("/run")) {
            return "执行";
        }
        if (normalized.contains("/login")) {
            return "登录";
        }
        if (normalized.contains("/delete")) {
            return "删除";
        }
        if (normalized.contains("/insert") || normalized.contains("/add")) {
            return "新增";
        }
        if (normalized.contains("/update") || normalized.contains("/rollback") || normalized.contains("/clear")) {
            return "修改";
        }
        if (normalized.contains("/detail") || normalized.contains("/list") || normalized.contains("/get")) {
            return "查询";
        }
        if ("generate".equalsIgnoreCase(methodName)) {
            return "生成";
        }
        return "访问";
    }

    private OperationLogDetailLevel inferDetailLevel(String uri) {
        String normalized = uri.toLowerCase();
        if (normalized.contains("/run")
                || normalized.contains("/getpageconfig")
                || normalized.contains("/viewdata")
                || normalized.contains("/generate")) {
            return OperationLogDetailLevel.SUMMARY;
        }
        return OperationLogDetailLevel.FULL;
    }
}

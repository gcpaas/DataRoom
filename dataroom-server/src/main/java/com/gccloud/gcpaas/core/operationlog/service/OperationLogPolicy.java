package com.gccloud.gcpaas.core.operationlog.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.gccloud.gcpaas.core.operationlog.model.OperationLogContext;
import com.gccloud.gcpaas.core.util.JsonUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.http.MediaType;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
public class OperationLogPolicy {

    private static final int MAX_TEXT_LENGTH = 4000;
    private static final int SUMMARY_LENGTH = 1000;
    private static final Set<String> SENSITIVE_KEYS = Set.of(
            "password", "oldpassword", "newpassword", "token", "authorization", "cookie",
            "secret", "accesskey", "secretkey", "privatekey"
    );

    public String sanitizeQueryString(String queryString) {
        if (StringUtils.isBlank(queryString)) {
            return null;
        }
        Map<String, Object> queryMap = new LinkedHashMap<>();
        for (String part : queryString.split("&")) {
            if (StringUtils.isBlank(part)) {
                continue;
            }
            String[] pieces = part.split("=", 2);
            String key = pieces[0];
            String value = pieces.length > 1 ? pieces[1] : "";
            queryMap.put(key, value);
        }
        return truncate(toJson(redactObject(queryMap)), MAX_TEXT_LENGTH);
    }

    public String extractAndSanitizeRequestBody(HttpServletRequest request) {
        if (!(request instanceof ContentCachingRequestWrapper wrapper)) {
            return null;
        }
        if (isMultipart(wrapper.getContentType())) {
            return "[multipart payload omitted]";
        }
        byte[] content = wrapper.getContentAsByteArray();
        if (content.length == 0) {
            return null;
        }
        String body = new String(content, StandardCharsets.UTF_8);
        if (StringUtils.isBlank(body)) {
            return null;
        }
        Object value = parseBodyObject(wrapper.getContentType(), body);
        if (value == null) {
            return truncate(body, MAX_TEXT_LENGTH);
        }
        return truncate(toJson(redactObject(value)), MAX_TEXT_LENGTH);
    }

    public Map<String, Object> parseBodyAsMap(HttpServletRequest request) {
        if (!(request instanceof ContentCachingRequestWrapper wrapper)) {
            return null;
        }
        if (isMultipart(wrapper.getContentType())) {
            return null;
        }
        byte[] content = wrapper.getContentAsByteArray();
        if (content.length == 0) {
            return null;
        }
        String body = new String(content, StandardCharsets.UTF_8);
        if (StringUtils.isBlank(body)) {
            return null;
        }
        Object parsed = parseBodyObject(wrapper.getContentType(), body);
        if (parsed instanceof Map<?, ?> map) {
            Map<String, Object> result = new LinkedHashMap<>();
            map.forEach((key, value) -> result.put(String.valueOf(key), value));
            return result;
        }
        return null;
    }

    public String buildRequestSummary(OperationLogContext context) {
        StringBuilder summary = new StringBuilder();
        if (StringUtils.isNotBlank(context.getQueryParams())) {
            summary.append("query=").append(context.getQueryParams());
        }
        if (StringUtils.isNotBlank(context.getRequestBody())) {
            if (summary.length() > 0) {
                summary.append("; ");
            }
            summary.append("body=").append(context.getRequestBody());
        }
        return truncate(summary.toString(), SUMMARY_LENGTH);
    }

    public String truncateStack(String stack) {
        return truncate(stack, MAX_TEXT_LENGTH);
    }

    private Object parseBodyObject(String contentType, String body) {
        if (StringUtils.isBlank(contentType)) {
            return tryParseJson(body);
        }
        if (contentType.contains(MediaType.APPLICATION_JSON_VALUE)) {
            return tryParseJson(body);
        }
        return null;
    }

    private boolean isMultipart(String contentType) {
        return StringUtils.isNotBlank(contentType) && contentType.toLowerCase().contains("multipart/form-data");
    }

    private Object tryParseJson(String body) {
        try {
            return JsonUtils.getInstance().readValue(body, new TypeReference<Object>() {
            });
        } catch (Exception ignored) {
            log.error(ExceptionUtils.getStackTrace(ignored));
            return null;
        }
    }

    private Object redactObject(Object value) {
        if (value instanceof Map<?, ?> map) {
            Map<String, Object> result = new LinkedHashMap<>();
            map.forEach((key, item) -> {
                String strKey = String.valueOf(key);
                if (isSensitiveKey(strKey)) {
                    result.put(strKey, "***");
                } else {
                    result.put(strKey, redactObject(item));
                }
            });
            return result;
        }
        if (value instanceof List<?> list) {
            List<Object> result = new ArrayList<>(list.size());
            for (Object item : list) {
                result.add(redactObject(item));
            }
            return result;
        }
        return value;
    }

    private boolean isSensitiveKey(String key) {
        return key != null && SENSITIVE_KEYS.contains(key.toLowerCase());
    }

    private String toJson(Object value) {
        try {
            return JsonUtils.getInstance().writeValueAsString(value);
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            return String.valueOf(value);
        }
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength) + "...";
    }
}

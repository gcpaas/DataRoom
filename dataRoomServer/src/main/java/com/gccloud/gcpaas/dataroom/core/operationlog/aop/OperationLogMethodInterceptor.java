package com.gccloud.gcpaas.dataroom.core.operationlog.aop;

import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.operationlog.model.OperationLogContext;
import com.gccloud.gcpaas.dataroom.core.operationlog.model.OperationLogResolvedMeta;
import com.gccloud.gcpaas.dataroom.core.operationlog.service.OperationLogContextHolder;
import com.gccloud.gcpaas.dataroom.core.operationlog.service.OperationLogPolicy;
import com.gccloud.gcpaas.dataroom.core.operationlog.service.OperationLogPublisher;
import com.gccloud.gcpaas.dataroom.core.operationlog.service.OperationLogResolver;
import com.gccloud.gcpaas.dataroom.core.shiro.LoginUser;
import com.gccloud.gcpaas.dataroom.core.util.LoginUserUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.PropertyAccessorFactory;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.util.ClassUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.lang.reflect.InvocationTargetException;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
public class OperationLogMethodInterceptor implements MethodInterceptor {

    private final OperationLogResolver operationLogResolver;
    private final OperationLogPolicy operationLogPolicy;
    private final OperationLogPublisher operationLogPublisher;

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        Method method = invocation.getMethod();
        Class<?> targetClass = invocation.getThis() == null ? method.getDeclaringClass() : ClassUtils.getUserClass(invocation.getThis());
        HttpServletRequest request = currentRequest();
        String mappedUri = resolveMappedUri(targetClass, method);
        boolean toolInvocation = isToolInvocation(method);
        boolean currentMvcRequest = isCurrentMvcRequest(request, mappedUri);
        if (currentMvcRequest) {
            return invocation.proceed();
        }

        Map<String, Object> candidates = extractCandidates(invocation.getArguments());
        OperationLogContext context = createContext(request, targetClass, method, mappedUri, candidates, invocation.getArguments());
        try {
            Object result = toolInvocation && !currentMvcRequest ? invokeTargetDirectly(invocation) : invocation.proceed();
            fillResult(context, result);
            return result;
        } catch (Throwable throwable) {
            log.error(ExceptionUtils.getStackTrace(throwable));
            context.setResultStatus("FAILURE");
            context.setResponseCode(500);
            context.setResponseMessage(StringUtils.defaultIfBlank(throwable.getMessage(), "服务器异常"));
            context.setExceptionType(throwable.getClass().getSimpleName());
            context.setExceptionStack(operationLogPolicy.truncateStack(ExceptionUtils.getStackTrace(throwable)));
            throw throwable;
        } finally {
            context.setDurationMs((System.nanoTime() - context.getRequestStartNanos()) / 1_000_000);
            operationLogPublisher.publish(context);
        }
    }

    private OperationLogContext createContext(HttpServletRequest request, Class<?> targetClass, Method method,
                                              String mappedUri, Map<String, Object> candidates, Object[] arguments) {
        OperationLogResolvedMeta resolvedMeta = operationLogResolver.resolve(mappedUri, targetClass, method, candidates);
        OperationLogContext context = new OperationLogContext();
        context.setTraceId(UUID.randomUUID().toString().replace("-", ""));
        context.setRequestUri(mappedUri);
        context.setRequestMethod(resolveRequestMethod(method));
        context.setRequestTime(new Date());
        context.setRequestStartNanos(System.nanoTime());
        if (request != null) {
            context.setClientIp(request.getRemoteAddr());
            context.setUserAgent(request.getHeader("User-Agent"));
            context.setContentType(request.getContentType());
            context.setQueryParams(operationLogPolicy.sanitizeQueryString(request.getQueryString()));
        }
        fillOperator(context);
        context.setTargetType(resolvedMeta.getTargetType());
        context.setTargetId(resolvedMeta.getTargetId());
        context.setTargetName(resolvedMeta.getTargetName());
        context.setActionType(resolvedMeta.getActionType());
        context.setActionDesc(resolvedMeta.getActionDesc());
        context.setBusinessType(resolvedMeta.getBusinessType());
        context.setBusinessName(resolvedMeta.getBusinessName());
        context.setBusinessDesc(resolvedMeta.getBusinessDesc());
        context.setTargetIdKey(resolvedMeta.getTargetIdKey());
        context.setTargetNameKey(resolvedMeta.getTargetNameKey());
        context.setDetailLevel(resolvedMeta.getDetailLevel());
        context.setRequestBody(operationLogPolicy.sanitizePayload(arguments.length == 1 ? arguments[0] : arguments));
        operationLogResolver.fillTargetFields(context, candidates);
        context.setRequestParamSummary(operationLogPolicy.buildRequestSummary(context));
        return context;
    }

    private void fillResult(OperationLogContext context, Object result) {
        if (result instanceof Resp<?> resp) {
            context.setResponseCode(resp.getCode());
            context.setResponseMessage(resp.getMessage());
            context.setResultStatus(resp.getCode() != null && resp.getCode() == 200 ? "SUCCESS" : "FAILURE");
            return;
        }
        context.setResponseCode(200);
        context.setResultStatus("SUCCESS");
    }

    private void fillOperator(OperationLogContext context) {
        LoginUser currentUser = LoginUserUtils.getCurrentUser();
        if (currentUser == null) {
            return;
        }
        context.setOperatorId(currentUser.getId());
        context.setOperatorName(currentUser.getUsername());
        context.setOperatorRole(currentUser.getRole());
        context.setTenantCode(currentUser.getTenantCode());
    }

    private HttpServletRequest currentRequest() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            return attributes.getRequest();
        }
        return null;
    }

    private boolean isCurrentMvcRequest(HttpServletRequest request, String mappedUri) {
        if (request == null || OperationLogContextHolder.get(request) == null) {
            return false;
        }
        return operationLogResolver.normalizeUri(request).equals(mappedUri);
    }

    private String resolveRequestMethod(Method method) {
        return isToolInvocation(method) ? "MCP" : "METHOD";
    }

    private boolean isToolInvocation(Method method) {
        return AnnotatedElementUtils.findMergedAnnotation(method, Tool.class) != null;
    }

    private Object invokeTargetDirectly(MethodInvocation invocation) throws Throwable {
        try {
            Method method = invocation.getMethod();
            method.setAccessible(true);
            return method.invoke(invocation.getThis(), invocation.getArguments());
        } catch (InvocationTargetException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw e.getTargetException();
        }
    }

    private String resolveMappedUri(Class<?> targetClass, Method method) {
        String classPath = extractPath(AnnotatedElementUtils.findMergedAnnotation(targetClass, RequestMapping.class));
        String methodPath = extractPath(AnnotatedElementUtils.findMergedAnnotation(method, RequestMapping.class));
        String joined = joinPath(classPath, methodPath);
        if (StringUtils.isNotBlank(joined)) {
            return joined;
        }
        Tool tool = AnnotatedElementUtils.findMergedAnnotation(method, Tool.class);
        if (tool != null && StringUtils.isNotBlank(tool.name())) {
            return "/mcp/tool/" + tool.name();
        }
        return targetClass.getName() + "#" + method.getName();
    }

    private String extractPath(RequestMapping mapping) {
        if (mapping == null) {
            return "";
        }
        if (mapping.path().length > 0) {
            return mapping.path()[0];
        }
        if (mapping.value().length > 0) {
            return mapping.value()[0];
        }
        return "";
    }

    private String joinPath(String classPath, String methodPath) {
        String left = StringUtils.defaultString(classPath);
        String right = StringUtils.defaultString(methodPath);
        if (StringUtils.isBlank(left)) {
            return normalizePath(right);
        }
        if (StringUtils.isBlank(right)) {
            return normalizePath(left);
        }
        return normalizePath(left) + "/" + StringUtils.removeStart(right, "/");
    }

    private String normalizePath(String path) {
        if (StringUtils.isBlank(path)) {
            return "";
        }
        return path.startsWith("/") ? path : "/" + path;
    }

    private Map<String, Object> extractCandidates(Object[] arguments) {
        Map<String, Object> candidates = new LinkedHashMap<>();
        for (int i = 0; i < arguments.length; i++) {
            Object argument = arguments[i];
            if (argument == null) {
                continue;
            }
            candidates.put("arg" + i, argument);
            if (argument instanceof Map<?, ?> map) {
                map.forEach((key, value) -> candidates.put(String.valueOf(key), value));
                continue;
            }
            if (isSimpleValue(argument)) {
                continue;
            }
            try {
                BeanWrapper beanWrapper = PropertyAccessorFactory.forBeanPropertyAccess(argument);
                for (var descriptor : beanWrapper.getPropertyDescriptors()) {
                    String name = descriptor.getName();
                    if (!"class".equals(name) && beanWrapper.isReadableProperty(name)) {
                        candidates.putIfAbsent(name, beanWrapper.getPropertyValue(name));
                    }
                }
            } catch (Exception e) {
                log.error(ExceptionUtils.getStackTrace(e));
            }
        }
        return candidates;
    }

    private boolean isSimpleValue(Object value) {
        return value instanceof CharSequence
                || value instanceof Number
                || value instanceof Boolean
                || value instanceof Enum<?>;
    }
}

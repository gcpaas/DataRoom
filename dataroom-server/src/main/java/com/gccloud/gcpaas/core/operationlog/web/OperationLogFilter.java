package com.gccloud.gcpaas.core.operationlog.web;

import com.gccloud.gcpaas.core.operationlog.model.OperationLogContext;
import com.gccloud.gcpaas.core.operationlog.service.OperationLogContextHolder;
import com.gccloud.gcpaas.core.operationlog.service.OperationLogPolicy;
import com.gccloud.gcpaas.core.operationlog.service.OperationLogPublisher;
import com.gccloud.gcpaas.core.operationlog.service.OperationLogResolver;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpMethod;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.io.IOException;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

public class OperationLogFilter extends OncePerRequestFilter {

    private final OperationLogPolicy operationLogPolicy;
    private final OperationLogResolver operationLogResolver;
    private final OperationLogPublisher operationLogPublisher;

    public OperationLogFilter(OperationLogPolicy operationLogPolicy,
                              OperationLogResolver operationLogResolver,
                              OperationLogPublisher operationLogPublisher) {
        this.operationLogPolicy = operationLogPolicy;
        this.operationLogResolver = operationLogResolver;
        this.operationLogPublisher = operationLogPublisher;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return HttpMethod.OPTIONS.matches(request.getMethod())
                || !request.getRequestURI().startsWith("/dataRoom/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        ContentCachingRequestWrapper wrappedRequest = request instanceof ContentCachingRequestWrapper wrapper
                ? wrapper
                : new ContentCachingRequestWrapper(request);
        OperationLogContext context = OperationLogContextHolder.getOrCreate(wrappedRequest);
        context.setTraceId(UUID.randomUUID().toString().replace("-", ""));
        context.setRequestUri(operationLogResolver.normalizeUri(wrappedRequest));
        context.setRequestMethod(wrappedRequest.getMethod());
        context.setClientIp(wrappedRequest.getRemoteAddr());
        context.setUserAgent(wrappedRequest.getHeader("User-Agent"));
        context.setContentType(wrappedRequest.getContentType());
        context.setQueryParams(operationLogPolicy.sanitizeQueryString(wrappedRequest.getQueryString()));
        context.setRequestTime(new Date());
        context.setRequestStartNanos(System.nanoTime());

        try {
            filterChain.doFilter(wrappedRequest, response);
        } finally {
            context.setRequestBody(operationLogPolicy.extractAndSanitizeRequestBody(wrappedRequest));
            Map<String, Object> requestBodyMap = operationLogPolicy.parseBodyAsMap(wrappedRequest);
            operationLogResolver.fillTargetFields(context, wrappedRequest, requestBodyMap);
            context.setRequestParamSummary(operationLogPolicy.buildRequestSummary(context));
            if (context.getExceptionStack() != null) {
                context.setExceptionStack(operationLogPolicy.truncateStack(context.getExceptionStack()));
            }
            context.setDurationMs((System.nanoTime() - context.getRequestStartNanos()) / 1_000_000);
            if (context.getResponseCode() == null) {
                context.setResponseCode(response.getStatus());
            }
            if (StringUtils.isBlank(context.getResultStatus())) {
                context.setResultStatus(response.getStatus() >= 400 ? "FAILURE" : "SUCCESS");
            }
            operationLogPublisher.publish(context);
            OperationLogContextHolder.clear(wrappedRequest);
        }
    }
}

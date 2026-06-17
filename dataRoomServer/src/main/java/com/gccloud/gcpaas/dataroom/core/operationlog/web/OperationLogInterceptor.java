package com.gccloud.gcpaas.dataroom.core.operationlog.web;

import com.gccloud.gcpaas.dataroom.core.operationlog.model.OperationLogContext;
import com.gccloud.gcpaas.dataroom.core.operationlog.model.OperationLogResolvedMeta;
import com.gccloud.gcpaas.dataroom.core.operationlog.service.OperationLogContextHolder;
import com.gccloud.gcpaas.dataroom.core.operationlog.service.OperationLogResolver;
import com.gccloud.gcpaas.dataroom.core.shiro.LoginUser;
import com.gccloud.gcpaas.dataroom.core.util.LoginUserUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@RequiredArgsConstructor
public class OperationLogInterceptor implements HandlerInterceptor {

    private final OperationLogResolver operationLogResolver;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }
        if (handler instanceof HandlerMethod handlerMethod) {
            OperationLogContext context = OperationLogContextHolder.getOrCreate(request);
            fillOperator(context);
            OperationLogResolvedMeta resolvedMeta = operationLogResolver.resolve(request, handlerMethod, null);
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
            context.setHandlerStartNanos(System.nanoTime());
        }
        return true;
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

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return;
        }
        OperationLogContext context = OperationLogContextHolder.get(request);
        if (context != null && context.getHandlerStartNanos() > 0) {
            context.setHandlerDurationMs((System.nanoTime() - context.getHandlerStartNanos()) / 1_000_000);
        }
    }
}

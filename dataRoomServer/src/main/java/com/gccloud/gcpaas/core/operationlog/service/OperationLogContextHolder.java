package com.gccloud.gcpaas.core.operationlog.service;

import com.gccloud.gcpaas.core.operationlog.model.OperationLogContext;
import jakarta.servlet.http.HttpServletRequest;

public class OperationLogContextHolder {

    public static final String ATTRIBUTE = OperationLogContextHolder.class.getName() + ".CONTEXT";

    private OperationLogContextHolder() {
    }

    public static OperationLogContext get(HttpServletRequest request) {
        Object value = request.getAttribute(ATTRIBUTE);
        if (value instanceof OperationLogContext context) {
            return context;
        }
        return null;
    }

    public static OperationLogContext getOrCreate(HttpServletRequest request) {
        OperationLogContext context = get(request);
        if (context == null) {
            context = new OperationLogContext();
            request.setAttribute(ATTRIBUTE, context);
        }
        return context;
    }

    public static void clear(HttpServletRequest request) {
        request.removeAttribute(ATTRIBUTE);
    }
}

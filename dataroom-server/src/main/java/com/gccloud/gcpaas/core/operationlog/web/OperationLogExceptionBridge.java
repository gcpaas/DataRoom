package com.gccloud.gcpaas.core.operationlog.web;

import com.gccloud.gcpaas.core.operationlog.model.OperationLogContext;
import com.gccloud.gcpaas.core.operationlog.service.OperationLogContextHolder;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.exception.ExceptionUtils;

public class OperationLogExceptionBridge {

    private OperationLogExceptionBridge() {
    }

    public static void markFailure(HttpServletRequest request, Integer responseCode, String responseMessage, Throwable throwable) {
        OperationLogContext context = OperationLogContextHolder.getOrCreate(request);
        context.setResultStatus("FAILURE");
        context.setResponseCode(responseCode);
        context.setResponseMessage(responseMessage);
        if (throwable != null) {
            context.setExceptionType(throwable.getClass().getSimpleName());
            context.setExceptionStack(ExceptionUtils.getStackTrace(throwable));
        }
    }

    public static void markSuccess(HttpServletRequest request, Integer responseCode, String responseMessage) {
        OperationLogContext context = OperationLogContextHolder.getOrCreate(request);
        context.setResultStatus("SUCCESS");
        context.setResponseCode(responseCode);
        context.setResponseMessage(responseMessage);
    }
}

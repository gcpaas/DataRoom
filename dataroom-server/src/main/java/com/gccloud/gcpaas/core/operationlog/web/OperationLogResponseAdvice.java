package com.gccloud.gcpaas.core.operationlog.web;

import com.gccloud.gcpaas.core.bean.Resp;
import com.gccloud.gcpaas.core.operationlog.service.OperationLogContextHolder;
import io.swagger.v3.oas.annotations.Hidden;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@Hidden
@RestControllerAdvice
public class OperationLogResponseAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {
        if (body instanceof Resp<?> resp && request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest rawRequest = servletRequest.getServletRequest();
            OperationLogContextHolder.getOrCreate(rawRequest).setResponseCode(resp.getCode());
            OperationLogContextHolder.getOrCreate(rawRequest).setResponseMessage(resp.getMessage());
            if (resp.getCode() != null && resp.getCode() == 200) {
                OperationLogExceptionBridge.markSuccess(rawRequest, resp.getCode(), resp.getMessage());
            } else {
                OperationLogExceptionBridge.markFailure(rawRequest, resp.getCode(), resp.getMessage(), null);
            }
        }
        return body;
    }
}

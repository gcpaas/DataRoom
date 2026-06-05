package com.gccloud.gcpaas.core.operationlog.service;

import com.gccloud.gcpaas.core.entity.OperationLogEntity;
import com.gccloud.gcpaas.core.mapper.OperationLogMapper;
import com.gccloud.gcpaas.core.operationlog.model.OperationLogContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class OperationLogPersistService {

    private final OperationLogMapper operationLogMapper;

    public void persist(OperationLogContext context) {
        try {
            OperationLogEntity entity = new OperationLogEntity();
            entity.setTraceId(context.getTraceId());
            entity.setTenantCode(context.getTenantCode());
            entity.setOperatorId(context.getOperatorId());
            entity.setOperatorName(context.getOperatorName());
            entity.setOperatorRole(context.getOperatorRole());
            entity.setTargetType(context.getTargetType());
            entity.setTargetId(context.getTargetId());
            entity.setTargetName(context.getTargetName());
            entity.setActionType(context.getActionType());
            entity.setActionDesc(context.getActionDesc());
            entity.setBusinessType(context.getBusinessType());
            entity.setBusinessName(context.getBusinessName());
            entity.setBusinessDesc(context.getBusinessDesc());
            entity.setRequestUri(context.getRequestUri());
            entity.setRequestMethod(context.getRequestMethod());
            entity.setClientIp(context.getClientIp());
            entity.setUserAgent(context.getUserAgent());
            entity.setContentType(context.getContentType());
            entity.setQueryParams(context.getQueryParams());
            entity.setRequestBody(context.getRequestBody());
            entity.setRequestParamSummary(context.getRequestParamSummary());
            entity.setResultStatus(context.getResultStatus());
            entity.setResponseCode(context.getResponseCode());
            entity.setResponseMessage(context.getResponseMessage());
            entity.setExceptionType(context.getExceptionType());
            entity.setExceptionStack(context.getExceptionStack());
            entity.setRequestTime(context.getRequestTime());
            entity.setDurationMs(context.getDurationMs());
            entity.setHandlerDurationMs(context.getHandlerDurationMs());
            operationLogMapper.insert(entity);
        } catch (Exception e) {
            log.error("persist operation log failed", e);
        }
    }
}

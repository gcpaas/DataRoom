package com.gccloud.gcpaas.dataroom.core.operationlog.model;

import lombok.Data;

import java.util.Date;

@Data
public class OperationLogContext {

    private String traceId;
    private String tenantCode;
    private String operatorId;
    private String operatorName;
    private String operatorRole;
    private String targetType;
    private String targetId;
    private String targetName;
    private String actionType;
    private String actionDesc;
    private String businessType;
    private String businessName;
    private String businessDesc;
    private String targetIdKey;
    private String targetNameKey;
    private String requestUri;
    private String requestMethod;
    private String clientIp;
    private String userAgent;
    private String contentType;
    private String queryParams;
    private String requestBody;
    private String requestParamSummary;
    private String resultStatus;
    private Integer responseCode;
    private String responseMessage;
    private String exceptionType;
    private String exceptionStack;
    private Date requestTime;
    private Long durationMs;
    private Long handlerDurationMs;
    private OperationLogDetailLevel detailLevel = OperationLogDetailLevel.FULL;
    private long requestStartNanos;
    private long handlerStartNanos;

    public OperationLogContext snapshot() {
        OperationLogContext copy = new OperationLogContext();
        copy.traceId = this.traceId;
        copy.tenantCode = this.tenantCode;
        copy.operatorId = this.operatorId;
        copy.operatorName = this.operatorName;
        copy.operatorRole = this.operatorRole;
        copy.targetType = this.targetType;
        copy.targetId = this.targetId;
        copy.targetName = this.targetName;
        copy.actionType = this.actionType;
        copy.actionDesc = this.actionDesc;
        copy.businessType = this.businessType;
        copy.businessName = this.businessName;
        copy.businessDesc = this.businessDesc;
        copy.targetIdKey = this.targetIdKey;
        copy.targetNameKey = this.targetNameKey;
        copy.requestUri = this.requestUri;
        copy.requestMethod = this.requestMethod;
        copy.clientIp = this.clientIp;
        copy.userAgent = this.userAgent;
        copy.contentType = this.contentType;
        copy.queryParams = this.queryParams;
        copy.requestBody = this.requestBody;
        copy.requestParamSummary = this.requestParamSummary;
        copy.resultStatus = this.resultStatus;
        copy.responseCode = this.responseCode;
        copy.responseMessage = this.responseMessage;
        copy.exceptionType = this.exceptionType;
        copy.exceptionStack = this.exceptionStack;
        copy.requestTime = this.requestTime == null ? null : new Date(this.requestTime.getTime());
        copy.durationMs = this.durationMs;
        copy.handlerDurationMs = this.handlerDurationMs;
        copy.detailLevel = this.detailLevel;
        copy.requestStartNanos = this.requestStartNanos;
        copy.handlerStartNanos = this.handlerStartNanos;
        return copy;
    }
}

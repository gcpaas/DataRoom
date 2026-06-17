package com.gccloud.gcpaas.dataroom.core.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Date;

@Data
@Schema(description = "操作日志")
@TableName("dr_operation_log")
public class OperationLogEntity extends BaseEntity {

    private String traceId;
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
}

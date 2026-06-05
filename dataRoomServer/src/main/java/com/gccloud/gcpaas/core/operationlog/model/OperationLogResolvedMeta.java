package com.gccloud.gcpaas.core.operationlog.model;

import lombok.Data;

@Data
public class OperationLogResolvedMeta {

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
    private OperationLogDetailLevel detailLevel = OperationLogDetailLevel.FULL;
}

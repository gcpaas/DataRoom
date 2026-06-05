package com.gccloud.gcpaas.core.operationlog.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.gcpaas.core.bean.PageVo;
import com.gccloud.gcpaas.core.entity.OperationLogEntity;
import com.gccloud.gcpaas.core.mapper.OperationLogMapper;
import com.gccloud.gcpaas.core.operationlog.dto.OperationLogQueryDTO;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

@Service
public class OperationLogService extends ServiceImpl<OperationLogMapper, OperationLogEntity> {

    public PageVo<OperationLogEntity> page(OperationLogQueryDTO queryDTO) {
        Page<OperationLogEntity> page = new Page<>(queryDTO.getCurrent(), queryDTO.getSize());
        LambdaQueryWrapper<OperationLogEntity> queryWrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(queryDTO.getKeyword())) {
            queryWrapper.and(wrapper -> wrapper
                    .like(OperationLogEntity::getOperatorName, queryDTO.getKeyword())
                    .or().like(OperationLogEntity::getBusinessName, queryDTO.getKeyword())
                    .or().like(OperationLogEntity::getActionDesc, queryDTO.getKeyword())
                    .or().like(OperationLogEntity::getRequestUri, queryDTO.getKeyword())
                    .or().like(OperationLogEntity::getTargetName, queryDTO.getKeyword()));
        }
        if (StringUtils.isNotBlank(queryDTO.getResultStatus())) {
            queryWrapper.eq(OperationLogEntity::getResultStatus, queryDTO.getResultStatus());
        }
        queryWrapper.select(
                OperationLogEntity::getId,
                OperationLogEntity::getOperatorId,
                OperationLogEntity::getOperatorName,
                OperationLogEntity::getOperatorRole,
                OperationLogEntity::getTargetType,
                OperationLogEntity::getTargetId,
                OperationLogEntity::getTargetName,
                OperationLogEntity::getActionType,
                OperationLogEntity::getActionDesc,
                OperationLogEntity::getBusinessType,
                OperationLogEntity::getBusinessName,
                OperationLogEntity::getRequestUri,
                OperationLogEntity::getRequestMethod,
                OperationLogEntity::getClientIp,
                OperationLogEntity::getResultStatus,
                OperationLogEntity::getResponseCode,
                OperationLogEntity::getResponseMessage,
                OperationLogEntity::getRequestTime,
                OperationLogEntity::getDurationMs,
                OperationLogEntity::getCreateDate
        );
        queryWrapper.orderByDesc(OperationLogEntity::getRequestTime)
                .orderByDesc(OperationLogEntity::getCreateDate);
        return PageVo.build(this.page(page, queryWrapper));
    }
}

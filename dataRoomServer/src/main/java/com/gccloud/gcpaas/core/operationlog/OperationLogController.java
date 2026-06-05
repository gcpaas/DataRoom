package com.gccloud.gcpaas.core.operationlog;

import com.gccloud.gcpaas.core.bean.PageVo;
import com.gccloud.gcpaas.core.bean.Resp;
import com.gccloud.gcpaas.core.constant.DataRoomRole;
import com.gccloud.gcpaas.core.entity.OperationLogEntity;
import com.gccloud.gcpaas.core.operationlog.annotation.OperationLogMeta;
import com.gccloud.gcpaas.core.operationlog.dto.OperationLogQueryDTO;
import com.gccloud.gcpaas.core.operationlog.service.OperationLogService;
import com.github.xiaoymin.knife4j.annotations.ApiSort;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "访问日志")
@ApiSort(value = 210)
@RestController
@RequestMapping("/dataRoom/operationLog")
@OperationLogMeta(targetType = "operation_log", businessType = "operation_log", businessName = "访问日志")
public class OperationLogController {

    private final OperationLogService operationLogService;

    public OperationLogController(OperationLogService operationLogService) {
        this.operationLogService = operationLogService;
    }

    @GetMapping("/page")
    @RequiresRoles(value = DataRoomRole.MANAGER)
    @Operation(summary = "分页查询访问日志")
    public Resp<PageVo<OperationLogEntity>> page(OperationLogQueryDTO queryDTO) {
        return Resp.success(operationLogService.page(queryDTO));
    }
}

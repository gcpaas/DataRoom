package com.gccloud.gcpaas.core.operationlog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "访问日志查询参数")
public class OperationLogQueryDTO {

    @Schema(description = "关键字（操作人、业务名称、访问地址）")
    private String keyword;

    @Schema(description = "结果状态")
    private String resultStatus;

    @Schema(description = "当前页")
    private Integer current = 1;

    @Schema(description = "每页条数")
    private Integer size = 10;
}

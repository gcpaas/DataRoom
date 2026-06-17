package com.gccloud.gcpaas.dataroom.core.page.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "页面重命名参数")
public class PageRenameDto {
    @Schema(description = "页面编码", requiredMode = Schema.RequiredMode.REQUIRED)
    private String code;

    @Schema(description = "新名称", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;
}

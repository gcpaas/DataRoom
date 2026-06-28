package com.gccloud.gcpaas.dataroom.core.page.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "页面封面更新参数")
public class PageThumbnailUpdateDto {
    @Schema(description = "页面编码", requiredMode = Schema.RequiredMode.REQUIRED)
    private String code;

    @Schema(description = "封面地址", requiredMode = Schema.RequiredMode.REQUIRED)
    private String thumbnail;
}

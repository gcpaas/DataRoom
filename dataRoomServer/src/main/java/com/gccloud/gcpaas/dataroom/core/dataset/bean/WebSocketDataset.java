package com.gccloud.gcpaas.dataroom.core.dataset.bean;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * WebSocket 数据集配置。
 */
@Data
public class WebSocketDataset extends BaseDataset implements StreamingDataset {

    @Schema(description = "WebSocket 地址")
    private String url;

    @Schema(description = "数据处理方式：json 或 script；未指定时，有非空脚本使用 script，否则使用 json",
            allowableValues = {"json", "script"})
    private String processingMode;

    @Schema(description = "JSON 模式的数据提取路径，如 $.data.rows；为空时使用完整 JSON")
    private String jsonPath;

    @Schema(description = "消息处理脚本，仅 script 模式使用且必填")
    private String script;

    @Schema(description = "测试样本数据")
    private String sampleData;
}

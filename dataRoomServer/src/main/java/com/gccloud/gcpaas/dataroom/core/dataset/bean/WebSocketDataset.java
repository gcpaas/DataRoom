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

    @Schema(description = "消息处理 Groovy 脚本")
    private String script;

    @Schema(description = "测试样本数据")
    private String sampleData;
}

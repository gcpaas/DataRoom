package com.gccloud.gcpaas.dataroom.core.dataset.bean;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class MqttDataset extends BaseDataset implements StreamingDataset {

    @Schema(description = "订阅主题")
    private String topic;

    @Schema(description = "最新消息缓存条数")
    private Integer cacheSize = 5;

    @Schema(description = "JSON字段映射规则")
    private List<JsonFieldMapping> jsonFieldMappings = new ArrayList<>();

    @Schema(description = "空数据策略: emptyArray, null")
    private String emptyDataStrategy = "emptyArray";

    @Schema(description = "测试样本数据")
    private String sampleData;

    @Schema(description = "数据处理方式：json 或 script；未指定时保留旧字段映射", allowableValues = {"json", "script"})
    private String processingMode;

    @Schema(description = "JSON 模式提取路径；为空使用完整 JSON")
    private String jsonPath;

    @Schema(description = "消息处理脚本，仅 script 模式使用且必填")
    private String script;

    @Override
    public String getSampleData() {
        return sampleData;
    }

    @Data
    public static class JsonFieldMapping {
        @Schema(description = "输出字段名")
        private String field;

        @Schema(description = "JSON路径")
        private String jsonPath;

        @Schema(description = "字段类型: string, number, boolean")
        private String type;
    }
}

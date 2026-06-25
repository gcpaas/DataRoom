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

    @Override
    public String getScript() {
        return null;
    }

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

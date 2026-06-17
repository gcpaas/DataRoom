package com.gccloud.gcpaas.dataroom.core.dataset;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

/**
 * 数据集执行请求
 */
@Data
public class DatasetRunRequest {
    /**
     * 数据集编码
     */
    @Schema(description = "数据集编码", requiredMode = Schema.RequiredMode.REQUIRED)
    private String datasetCode;
    /**
     * 图表名称
     */
    @Schema(description = "图表名称",requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private String chartName;
    /**
     * 入参列表
     */
    @JsonAlias("paramMap")
    @Schema(description = "数据集参数",requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private Map<String, Object> inputParam = new HashMap<>();
}

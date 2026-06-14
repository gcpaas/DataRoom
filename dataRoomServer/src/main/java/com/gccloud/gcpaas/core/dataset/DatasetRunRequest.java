package com.gccloud.gcpaas.core.dataset;

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
    @Schema(description = "数据集编码", required = true)
    private String datasetCode;
    /**
     * 图表名称
     */
    @Schema(description = "图表名称",required = false)
    private String chartName;
    /**
     * 入参列表
     */
    @JsonAlias("paramMap")
    @Schema(description = "数据集参数",required = false)
    private Map<String, Object> inputParam = new HashMap<>();
}

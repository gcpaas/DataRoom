package com.gccloud.gcpaas.core.dataset;

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
    private String datasetCode;
    /**
     * 图表名称
     */
    private String chartName;
    /**
     * 入参列表
     */
    private Map<String, Object> inputParam = new HashMap<>();
}

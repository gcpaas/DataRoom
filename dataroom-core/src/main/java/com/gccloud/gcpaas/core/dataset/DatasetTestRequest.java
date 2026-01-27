package com.gccloud.gcpaas.core.dataset;

import com.gccloud.gcpaas.core.entity.DatasetEntity;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

/**
 * 开发时数据集请求
 */
@Data
public class DatasetTestRequest {
    /**
     * 数据集配置
     */
    private DatasetEntity dataset;
    /**
     * 入参列表
     */
    private Map<String, Object> inputParam = new HashMap<>();
}

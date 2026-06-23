package com.gccloud.gcpaas.dataroom.core.dataset.runtime;

import com.gccloud.gcpaas.dataroom.core.constant.DatasetType;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

/**
 * 流式数据集消息上下文。
 */
@Data
public class StreamingDatasetMessageContext {

    private String datasetCode;

    private DatasetType datasetType;

    private String message;

    private Object payload;

    private Map<String, Object> metadata = new HashMap<>();

    private Map<String, Object> params = new HashMap<>();
}

package com.gccloud.gcpaas.dataroom.core.dataset.runtime;

import com.gccloud.gcpaas.dataroom.core.constant.DatasetType;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;

import java.util.Map;

/**
 * 流式数据集运行态工厂。
 */
public interface StreamingDatasetRuntimeFactory {

    boolean supports(DatasetType datasetType);

    StreamingDatasetRuntime create(DatasetEntity datasetEntity, Map<String, Object> params);
}

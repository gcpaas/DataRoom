package com.gccloud.gcpaas.dataroom.core.dataset.runtime;

import com.gccloud.gcpaas.dataroom.core.constant.DatasetType;

/**
 * 流式数据集运行态。
 */
public interface StreamingDatasetRuntime {

    String datasetCode();

    DatasetType datasetType();

    void start();

    void stop();

    boolean isRunning();
}

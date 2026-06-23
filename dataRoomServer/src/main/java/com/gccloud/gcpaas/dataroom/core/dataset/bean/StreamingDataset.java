package com.gccloud.gcpaas.dataroom.core.dataset.bean;

/**
 * 流式数据集配置接口。
 */
public interface StreamingDataset {

    String getScript();

    String getSampleData();
}

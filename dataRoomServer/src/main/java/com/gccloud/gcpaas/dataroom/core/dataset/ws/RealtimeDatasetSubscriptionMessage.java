package com.gccloud.gcpaas.dataroom.core.dataset.ws;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 实时数据集订阅消息。
 */
@Data
public class RealtimeDatasetSubscriptionMessage {

    private String type;

    private List<String> datasetCodes;

    private List<DatasetSubscription> subscriptions;

    @Data
    public static class DatasetSubscription {

        private String datasetCode;

        private Map<String, Object> paramMap;
    }
}

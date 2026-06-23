package com.gccloud.gcpaas.dataroom.core.dataset.runtime;

import com.gccloud.gcpaas.dataroom.core.constant.DatasetType;
import com.gccloud.gcpaas.dataroom.core.dataset.service.StreamingDatasetMessageProcessor;
import com.gccloud.gcpaas.dataroom.core.dataset.ws.RealtimeDatasetSessionRegistry;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * WebSocket 流式数据集运行态工厂。
 */
@Component
public class WebSocketStreamingDatasetRuntimeFactory implements StreamingDatasetRuntimeFactory {

    @Resource
    private StreamingDatasetMessageProcessor messageProcessor;

    @Resource
    private RealtimeDatasetSessionRegistry sessionRegistry;

    @Override
    public boolean supports(DatasetType datasetType) {
        return DatasetType.WEBSOCKET.equals(datasetType);
    }

    @Override
    public StreamingDatasetRuntime create(DatasetEntity datasetEntity, Map<String, Object> params) {
        return new WebSocketStreamingDatasetRuntime(datasetEntity, params, messageProcessor, sessionRegistry);
    }
}

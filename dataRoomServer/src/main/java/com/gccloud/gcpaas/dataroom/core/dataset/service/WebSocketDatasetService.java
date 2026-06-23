package com.gccloud.gcpaas.dataroom.core.dataset.service;

import com.gccloud.gcpaas.dataroom.core.constant.DataRoomConstant;
import com.gccloud.gcpaas.dataroom.core.constant.DatasetType;
import com.gccloud.gcpaas.dataroom.core.dataset.DatasetRunRequest;
import com.gccloud.gcpaas.dataroom.core.dataset.DatasetRunResponse;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.WebSocketDataset;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * WebSocket 数据集服务。
 * 测试执行使用测试样本作为原始消息，真实订阅场景使用服务端收到的消息调用同一处理器。
 */
@Service(value = DatasetType.WEBSOCKET_TYPE + DataRoomConstant.Dataset.SERVICE_NAME)
public class WebSocketDatasetService extends AbstractDatasetService {

    @Resource
    private StreamingDatasetMessageProcessor streamingDatasetMessageProcessor;

    @Override
    public DatasetRunResponse run(DatasetRunRequest datasetRunRequest, DatasetEntity datasetEntity) {
        WebSocketDataset webSocketDataset = (WebSocketDataset) datasetEntity.getDataset();
        Map<String, Object> params = new HashMap<>();
        if (datasetRunRequest.getInputParam() != null) {
            params.putAll(datasetRunRequest.getInputParam());
        }
        Object data = processMessage(datasetEntity, webSocketDataset.getSampleData(), params);
        DatasetRunResponse datasetRunResponse = new DatasetRunResponse();
        datasetRunResponse.setData(data);
        return datasetRunResponse;
    }

    public Object processMessage(DatasetEntity datasetEntity, String message, Map<String, Object> params) {
        WebSocketDataset webSocketDataset = (WebSocketDataset) datasetEntity.getDataset();
        return streamingDatasetMessageProcessor.process(datasetEntity, webSocketDataset, message, params);
    }
}

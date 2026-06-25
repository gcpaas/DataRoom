package com.gccloud.gcpaas.dataroom.core.dataset.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.dataroom.core.constant.DataRoomConstant;
import com.gccloud.gcpaas.dataroom.core.constant.DatasetType;
import com.gccloud.gcpaas.dataroom.core.dataset.DatasetRunRequest;
import com.gccloud.gcpaas.dataroom.core.dataset.DatasetRunResponse;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.MqttDataset;
import com.gccloud.gcpaas.dataroom.core.dataset.runtime.MqttDatasetRuntime;
import com.gccloud.gcpaas.dataroom.core.dataset.runtime.MqttLatestMessageCache;
import com.gccloud.gcpaas.dataroom.core.dataset.runtime.StreamingDatasetRuntime;
import com.gccloud.gcpaas.dataroom.core.dataset.runtime.StreamingDatasetRuntimeManager;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service(value = DatasetType.MQTT_TYPE + DataRoomConstant.Dataset.SERVICE_NAME)
public class MqttDatasetService extends AbstractDatasetService {

    @Resource
    private StreamingDatasetMessageProcessor streamingDatasetMessageProcessor;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public DatasetRunResponse run(DatasetRunRequest datasetRunRequest, DatasetEntity datasetEntity) {
        MqttDataset mqttDataset = (MqttDataset) datasetEntity.getDataset();
        DatasetRunResponse response = new DatasetRunResponse();

        if (mqttDataset.getSampleData() != null && !mqttDataset.getSampleData().isBlank()) {
            Map<String, Object> params = new HashMap<>();
            if (datasetRunRequest.getInputParam() != null) {
                params.putAll(datasetRunRequest.getInputParam());
            }
            Object data = streamingDatasetMessageProcessor.process(datasetEntity, mqttDataset, mqttDataset.getSampleData(), params);
            response.setData(data);
        } else {
            if ("emptyArray".equals(mqttDataset.getEmptyDataStrategy())) {
                response.setData(new ArrayList<>());
            } else {
                response.setData(null);
            }
        }

        return response;
    }
}

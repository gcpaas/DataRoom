package com.gccloud.gcpaas.dataroom.core.dataset.runtime;

import com.gccloud.gcpaas.dataroom.core.constant.DatasetType;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.MqttDataset;
import com.gccloud.gcpaas.dataroom.core.dataset.ws.RealtimeDatasetSessionRegistry;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.MqttDatasource;
import com.gccloud.gcpaas.dataroom.core.entity.DataSourceEntity;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.mapper.DataSourceMapper;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class MqttDatasetRuntimeFactory implements StreamingDatasetRuntimeFactory {

    @Resource
    private DataSourceMapper dataSourceMapper;

    @Resource
    private RealtimeDatasetSessionRegistry sessionRegistry;

    @Override
    public boolean supports(DatasetType datasetType) {
        return DatasetType.MQTT.equals(datasetType);
    }

    @Override
    public StreamingDatasetRuntime create(DatasetEntity datasetEntity, Map<String, Object> params) {
        MqttDataset mqttDataset = (MqttDataset) datasetEntity.getDataset();
        DataSourceEntity dataSourceEntity = dataSourceMapper.getByCode(datasetEntity.getDataSourceCode());
        if (dataSourceEntity == null) {
            throw new DataRoomException("引用的MQTT数据源不存在");
        }
        MqttDatasource mqttDatasource = (MqttDatasource) dataSourceEntity.getDataSource();
        return new MqttDatasetRuntime(datasetEntity.getCode(), mqttDataset, mqttDatasource, sessionRegistry);
    }
}

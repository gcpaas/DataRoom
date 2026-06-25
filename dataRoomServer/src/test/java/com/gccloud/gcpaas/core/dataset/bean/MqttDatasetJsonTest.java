package com.gccloud.gcpaas.core.dataset.bean;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.BaseDataset;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.MqttDataset;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MqttDatasetJsonTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void deserializeMqttDataset() throws Exception {
        String json = """
                {
                  "name": "温度MQTT",
                  "datasetType": "mqtt",
                  "dataSourceCode": "DS_xxx",
                  "dataset": {
                    "datasetType": "mqtt",
                    "topic": "factory/line-1/temperature",
                    "cacheSize": 10,
                    "jsonFieldMappings": [
                      {"field": "temperature", "jsonPath": "$.temperature", "type": "number"},
                      {"field": "timestamp", "jsonPath": "$.timestamp", "type": "string"}
                    ],
                    "emptyDataStrategy": "emptyArray"
                  }
                }
                """;

        DatasetEntity entity = objectMapper.readValue(json, DatasetEntity.class);

        assertEquals("mqtt", entity.getDatasetType().getValue());
        MqttDataset mqtt = assertInstanceOf(MqttDataset.class, entity.getDataset());
        assertEquals("factory/line-1/temperature", mqtt.getTopic());
        assertEquals(10, mqtt.getCacheSize());
        assertEquals(2, mqtt.getJsonFieldMappings().size());
        assertEquals("temperature", mqtt.getJsonFieldMappings().get(0).getField());
        assertEquals("$.temperature", mqtt.getJsonFieldMappings().get(0).getJsonPath());
        assertEquals("number", mqtt.getJsonFieldMappings().get(0).getType());
        assertEquals("emptyArray", mqtt.getEmptyDataStrategy());
    }

    @Test
    void defaultCacheSizeIsFive() {
        MqttDataset mqtt = new MqttDataset();
        assertEquals(5, mqtt.getCacheSize());
    }

    @Test
    void deserializeMqttDatasetWithDefaults() throws Exception {
        String json = """
                {
                  "name": "最小配置",
                  "datasetType": "mqtt",
                  "dataset": {
                    "datasetType": "mqtt",
                    "topic": "test/topic"
                  }
                }
                """;

        DatasetEntity entity = objectMapper.readValue(json, DatasetEntity.class);

        MqttDataset mqtt = assertInstanceOf(MqttDataset.class, entity.getDataset());
        assertEquals("test/topic", mqtt.getTopic());
        assertEquals(5, mqtt.getCacheSize());
        assertEquals("emptyArray", mqtt.getEmptyDataStrategy());
        assertNotNull(mqtt.getJsonFieldMappings());
        assertTrue(mqtt.getJsonFieldMappings().isEmpty());
    }
}

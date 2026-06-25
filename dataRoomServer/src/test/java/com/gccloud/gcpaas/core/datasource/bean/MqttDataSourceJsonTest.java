package com.gccloud.gcpaas.core.datasource.bean;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.BaseDataSource;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.MqttDatasource;
import com.gccloud.gcpaas.dataroom.core.entity.DataSourceEntity;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MqttDataSourceJsonTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void deserializeMqttDatasource() throws Exception {
        String json = """
                {
                  "name": "生产MQTT",
                  "dataSourceType": "mqtt",
                  "dataSource": {
                    "dataSourceType": "mqtt",
                    "host": "broker.example.com",
                    "port": 8883,
                    "clientId": "dataroom-prod",
                    "authMode": "usernamePassword",
                    "username": "admin",
                    "password": "secret",
                    "defaultTopic": "factory/line-1/metrics",
                    "connectionTimeoutSeconds": 10
                  }
                }
                """;

        DataSourceEntity entity = objectMapper.readValue(json, DataSourceEntity.class);

        assertEquals("mqtt", entity.getDataSourceType().getValue());
        MqttDatasource mqtt = assertInstanceOf(MqttDatasource.class, entity.getDataSource());
        assertEquals("broker.example.com", mqtt.getHost());
        assertEquals(8883, mqtt.getPort());
        assertEquals("dataroom-prod", mqtt.getClientId());
        assertEquals("usernamePassword", mqtt.getAuthMode());
        assertEquals("admin", mqtt.getUsername());
        assertEquals("secret", mqtt.getPassword());
        assertEquals("factory/line-1/metrics", mqtt.getDefaultTopic());
        assertEquals(10, mqtt.getConnectionTimeoutSeconds());
    }

    @Test
    void desensitizeHidesPassword() throws Exception {
        String json = """
                {
                  "dataSourceType": "mqtt",
                  "host": "broker.example.com",
                  "port": 1883,
                  "authMode": "usernamePassword",
                  "password": "secret"
                }
                """;

        BaseDataSource datasource = objectMapper.readValue(json, BaseDataSource.class);
        datasource.desensitize();

        MqttDatasource mqtt = (MqttDatasource) datasource;
        assertEquals("******", mqtt.getPassword());
    }

    @Test
    void updatedSensitivePreservesExistingWhenBlank() throws Exception {
        MqttDatasource dbDatasource = new MqttDatasource();
        dbDatasource.setPassword("oldPassword");

        MqttDatasource updateDatasource = new MqttDatasource();
        updateDatasource.setPassword("");

        updateDatasource.updatedSensitive(dbDatasource);

        assertEquals("oldPassword", updateDatasource.getPassword());
    }

    @Test
    void updatedSensitivePreservesExistingWhenMasked() throws Exception {
        MqttDatasource dbDatasource = new MqttDatasource();
        dbDatasource.setPassword("realPassword");

        MqttDatasource updateDatasource = new MqttDatasource();
        updateDatasource.setPassword("******");

        updateDatasource.updatedSensitive(dbDatasource);

        assertEquals("realPassword", updateDatasource.getPassword());
    }

    @Test
    void updatedSensitiveUsesNewValueWhenProvided() throws Exception {
        MqttDatasource dbDatasource = new MqttDatasource();
        dbDatasource.setPassword("oldPassword");

        MqttDatasource updateDatasource = new MqttDatasource();
        updateDatasource.setPassword("newPassword");

        updateDatasource.updatedSensitive(dbDatasource);

        assertEquals("newPassword", updateDatasource.getPassword());
    }
}

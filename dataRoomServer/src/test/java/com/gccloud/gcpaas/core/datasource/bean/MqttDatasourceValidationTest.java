package com.gccloud.gcpaas.core.datasource.bean;

import com.gccloud.gcpaas.dataroom.core.datasource.bean.MqttDatasource;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MqttDatasourceValidationTest {

    @Test
    void validNoneAuthModePassesValidation() {
        MqttDatasource mqtt = buildBasic();
        mqtt.setAuthMode("none");
        assertDoesNotThrow(() -> mqtt.validate(true));
    }

    @Test
    void validUsernamePasswordPassesValidation() {
        MqttDatasource mqtt = buildBasic();
        mqtt.setAuthMode("usernamePassword");
        mqtt.setUsername("admin");
        mqtt.setPassword("secret");
        assertDoesNotThrow(() -> mqtt.validate(true));
    }

    @Test
    void blankHostFailsValidation() {
        MqttDatasource mqtt = buildBasic();
        mqtt.setHost("");
        DataRoomException ex = assertThrows(DataRoomException.class, () -> mqtt.validate(true));
        assertTrue(ex.getMessage().contains("地址"));
    }

    @Test
    void invalidPortFailsValidation() {
        MqttDatasource mqtt = buildBasic();
        mqtt.setPort(0);
        assertThrows(DataRoomException.class, () -> mqtt.validate(true));

        mqtt.setPort(70000);
        assertThrows(DataRoomException.class, () -> mqtt.validate(true));

        mqtt.setPort(null);
        assertThrows(DataRoomException.class, () -> mqtt.validate(true));
    }

    @Test
    void invalidAuthModeFailsValidation() {
        MqttDatasource mqtt = buildBasic();
        mqtt.setAuthMode("unknown");
        assertThrows(DataRoomException.class, () -> mqtt.validate(true));
    }

    @Test
    void tlsOneWayIsNowInvalidAuthMode() {
        MqttDatasource mqtt = buildBasic();
        mqtt.setAuthMode("tlsOneWay");
        assertThrows(DataRoomException.class, () -> mqtt.validate(true));
    }

    @Test
    void usernamePasswordModeRequiresUsernameOnCreate() {
        MqttDatasource mqtt = buildBasic();
        mqtt.setAuthMode("usernamePassword");
        mqtt.setUsername("");
        mqtt.setPassword("secret");
        assertThrows(DataRoomException.class, () -> mqtt.validate(true));
    }

    @Test
    void usernamePasswordModeRequiresPasswordOnCreate() {
        MqttDatasource mqtt = buildBasic();
        mqtt.setAuthMode("usernamePassword");
        mqtt.setUsername("admin");
        mqtt.setPassword("");
        assertThrows(DataRoomException.class, () -> mqtt.validate(true));
    }

    @Test
    void usernamePasswordModeAllowsBlankPasswordOnUpdate() {
        MqttDatasource mqtt = buildBasic();
        mqtt.setAuthMode("usernamePassword");
        mqtt.setUsername("admin");
        mqtt.setPassword("");
        assertDoesNotThrow(() -> mqtt.validate(false));
    }

    private MqttDatasource buildBasic() {
        MqttDatasource mqtt = new MqttDatasource();
        mqtt.setHost("broker.example.com");
        mqtt.setPort(1883);
        mqtt.setAuthMode("none");
        return mqtt;
    }
}

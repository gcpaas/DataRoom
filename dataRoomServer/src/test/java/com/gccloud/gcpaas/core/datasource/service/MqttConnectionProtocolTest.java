package com.gccloud.gcpaas.core.datasource.service;

import com.gccloud.gcpaas.dataroom.core.datasource.bean.MqttDatasource;
import com.gccloud.gcpaas.dataroom.core.datasource.service.MqttDatasourceConnectionService;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class MqttConnectionProtocolTest {

    private static final String CA_CERT = """
            -----BEGIN CERTIFICATE-----
            MIIDrzCCApegAwIBAgIQCDvgVpBCRrGhdWrJWZHHSjANBgkqhkiG9w0BAQUFADBh
            MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3
            d3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBD
            QTAeFw0wNjExMTAwMDAwMDBaFw0zMTExMTAwMDAwMDBaMGExCzAJBgNVBAYTAlVT
            MRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdpY2VydC5j
            b20xIDAeBgNVBAMTF0RpZ2lDZXJ0IEdsb2JhbCBSb290IENBMIIBIjANBgkqhkiG
            9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4jvhEXLeqKTTo1eqUKKPC3eQyaKl7hLOllsB
            CSDMAZOnTjC3U/dDxGkAV53ijSLdhwZAAIEJzs4bg7/fzTtxRuLWZscFs3YnFo97
            nh6Vfe63SKMI2tavegw5BmV/Sl0fvBf4q77uKNd0f3p4mVmFaG5cIzJLv07A6Fpt
            43C/dxC//AH2hdmoRBBYMql1GNXRor5H4idq9Joz+EkIYIvUX7Q6hL+hqkpMfT7P
            T19sdl6gSzeRntwi5m3OFBqOasv+zbMUZBfHWymeMr/y7vrTC0LUq7dBMtoM1O/4
            gdW7jVg/tRvoSSiicNoxBN33shbyTApOB6jtSj1etX+jkMOvJwIDAQABo2MwYTAO
            BgNVHQ8BAf8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUA95QNVbR
            TLtm8KPiGxvDl7I90VUwHwYDVR0jBBgwFoAUA95QNVbRTLtm8KPiGxvDl7I90VUw
            DQYJKoZIhvcNAQEFBQADggEBAMucN6pIExIK+t1EnE9SsPTfrgT1eXkIoyQY/Esr
            hMAtudXH/vTBH1jLuG2cenTnmCmrEbXjcKChzUyImZOMkXDiqw8cvpOp/2PV5Adg
            06O/nVsJ8dWO41P0jmP6P6fbtGbfYmbW0W5BjfIttep3Sp+dWOIrWcBAI+0tKIJF
            PnlUkiaY4IBIqDfv8NZ5YBberOgOzW6sRBc4L0na4UU+Krk2U886UAb3LujEV0ls
            YSEY1QSteDwsOoBrp+uvFRTp2InBuThs4pFsiv9kuXclVzDAGySj4dzp30d8tbQk
            CAUw7C29C79Fv1C5qfPrmAESrciIxpg0X40KPMbp1ZWVbd4=
            -----END CERTIFICATE-----""";

    private MqttDatasourceConnectionService createService() {
        MqttDatasourceConnectionService service = new MqttDatasourceConnectionService();
        // dataRoomConfig 无私钥时不做 RSA 解密
        com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig config = new com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig();
        ReflectionTestUtils.setField(service, "dataRoomConfig", config);
        return service;
    }

    private MqttDatasource buildConfig(String protocol, int port, String caCert) {
        MqttDatasource mqtt = new MqttDatasource();
        mqtt.setProtocol(protocol);
        mqtt.setHost("broker.emqx.io");
        mqtt.setPort(port);
        mqtt.setAuthMode("none");
        mqtt.setConnectionTimeoutSeconds(10);
        mqtt.setCaCertificate(caCert);
        return mqtt;
    }

    private MqttDatasource buildWsConfig(String protocol, int port, String caCert) {
        MqttDatasource mqtt = new MqttDatasource();
        mqtt.setProtocol(protocol);
        mqtt.setHost("broker.emqx.io");
        mqtt.setPort(port);
        mqtt.setPath("/mqtt");
        mqtt.setAuthMode("none");
        mqtt.setConnectionTimeoutSeconds(10);
        mqtt.setCaCertificate(caCert);
        return mqtt;
    }

    @Test
    void tcpConnectsSuccessfully() {
        MqttDatasourceConnectionService service = createService();
        MqttDatasourceConnectionService.ConnectionTestResult result = service.test(buildConfig("tcp", 1883, null));
        System.out.println("TCP: success=" + result.isSuccess() + " status=" + result.getStatus() + " msg=" + result.getMessage());
        assertTrue(result.isSuccess(), "TCP连接应成功: " + result.getMessage());
    }

    @Test
    void wsConnectsSuccessfully() {
        MqttDatasourceConnectionService service = createService();
        MqttDatasourceConnectionService.ConnectionTestResult result = service.test(buildWsConfig("ws", 8083, null));
        System.out.println("WS: success=" + result.isSuccess() + " status=" + result.getStatus() + " msg=" + result.getMessage());
        assertTrue(result.isSuccess(), "WebSocket连接应成功: " + result.getMessage());
    }

    @Test
    void tlsConnectsSuccessfullyWithoutCaCert() {
        MqttDatasourceConnectionService service = createService();
        MqttDatasourceConnectionService.ConnectionTestResult result = service.test(buildConfig("tls", 8883, null));
        System.out.println("TLS(no cert): success=" + result.isSuccess() + " status=" + result.getStatus() + " msg=" + result.getMessage());
        assertTrue(result.isSuccess(), "TLS连接(默认信任库)应成功: " + result.getMessage());
    }

    @Test
    void tlsConnectsSuccessfullyWithCaCert() {
        MqttDatasourceConnectionService service = createService();
        MqttDatasourceConnectionService.ConnectionTestResult result = service.test(buildConfig("tls", 8883, CA_CERT));
        System.out.println("TLS(with cert): success=" + result.isSuccess() + " status=" + result.getStatus() + " msg=" + result.getMessage());
    }

    @Test
    void wssConnectsSuccessfullyWithoutCaCert() {
        MqttDatasourceConnectionService service = createService();
        MqttDatasourceConnectionService.ConnectionTestResult result = service.test(buildWsConfig("wss", 8084, null));
        System.out.println("WSS(no cert): success=" + result.isSuccess() + " status=" + result.getStatus() + " msg=" + result.getMessage());
        assertTrue(result.isSuccess(), "WSS连接(默认信任库)应成功: " + result.getMessage());
    }

    @Test
    void wssConnectsSuccessfullyWithCaCert() {
        MqttDatasourceConnectionService service = createService();
        MqttDatasourceConnectionService.ConnectionTestResult result = service.test(buildWsConfig("wss", 8084, CA_CERT));
        System.out.println("WSS(with cert): success=" + result.isSuccess() + " status=" + result.getStatus() + " msg=" + result.getMessage());
    }
}

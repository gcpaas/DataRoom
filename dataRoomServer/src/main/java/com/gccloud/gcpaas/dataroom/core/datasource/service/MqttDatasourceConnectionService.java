package com.gccloud.gcpaas.dataroom.core.datasource.service;

import com.gccloud.gcpaas.dataroom.core.datasource.bean.MqttDatasource;
import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig;
import com.gccloud.gcpaas.dataroom.core.util.RsaUtils;
import com.hivemq.client.mqtt.MqttClient;
import com.hivemq.client.mqtt.mqtt3.Mqtt3AsyncClient;
import com.hivemq.client.mqtt.mqtt3.Mqtt3ClientBuilder;
import jakarta.annotation.Resource;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Service;

import javax.net.ssl.TrustManagerFactory;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class MqttDatasourceConnectionService {

    @Resource
    private DataRoomConfig dataRoomConfig;

    @Data
    public static class ConnectionTestResult {
        private boolean success;
        private String status;
        private String message;
        private LocalDateTime testedAt;

        public static ConnectionTestResult success() {
            ConnectionTestResult result = new ConnectionTestResult();
            result.setSuccess(true);
            result.setStatus("success");
            result.setMessage("连接与订阅校验已通过");
            result.setTestedAt(LocalDateTime.now());
            return result;
        }

        public static ConnectionTestResult fail(String status, String message) {
            ConnectionTestResult result = new ConnectionTestResult();
            result.setSuccess(false);
            result.setStatus(status);
            result.setMessage(message);
            result.setTestedAt(LocalDateTime.now());
            return result;
        }
    }

    public ConnectionTestResult test(MqttDatasource config) {
        if (StringUtils.isNotBlank(config.getPassword()) && StringUtils.isNotBlank(dataRoomConfig.getPrivateKey())) {
            try {
                config.setPassword(RsaUtils.decryptByPrivateKey(config.getPassword(), dataRoomConfig.getPrivateKey()));
            } catch (Exception e) {
                log.error(ExceptionUtils.getStackTrace(e));
            }
        }
        int timeout = config.getConnectionTimeoutSeconds() != null ? config.getConnectionTimeoutSeconds() : 10;
        String clientId = StringUtils.isNotBlank(config.getClientId())
                ? config.getClientId() + "-test-" + UUID.randomUUID().toString().substring(0, 8)
                : "dataroom-test-" + UUID.randomUUID().toString().substring(0, 8);

        Mqtt3AsyncClient client = null;
        try {
            Mqtt3ClientBuilder builder = MqttClient.builder()
                    .useMqttVersion3()
                    .identifier(clientId)
                    .serverHost(config.getHost())
                    .serverPort(config.getPort());

            String protocol = config.getProtocol() != null ? config.getProtocol() : "tcp";
            String wsPath = StringUtils.isNotBlank(config.getPath()) ? config.getPath() : "";
            switch (protocol) {
                case "tls" -> applySsl(builder, config.getCaCertificate());
                case "ws" -> builder.webSocketConfig().serverPath(wsPath).applyWebSocketConfig();
                case "wss" -> {
                    applySsl(builder, config.getCaCertificate());
                    builder.webSocketConfig().serverPath(wsPath).applyWebSocketConfig();
                }
                default -> { }
            }

            client = builder.buildAsync();

            var connectBuilder = client.connectWith();
            if ("usernamePassword".equals(config.getAuthMode())) {
                if (StringUtils.isNotBlank(config.getUsername())) {
                    connectBuilder.simpleAuth()
                            .username(config.getUsername())
                            .password(config.getPassword() != null ? config.getPassword().getBytes(StandardCharsets.UTF_8) : new byte[0])
                            .applySimpleAuth();
                }
            }

            connectBuilder.send().get(timeout, TimeUnit.SECONDS);

            if (StringUtils.isNotBlank(config.getDefaultTopic())) {
                client.subscribeWith()
                        .topicFilter(config.getDefaultTopic())
                        .send()
                        .get(timeout, TimeUnit.SECONDS);

                client.unsubscribeWith()
                        .topicFilter(config.getDefaultTopic())
                        .send()
                        .get(timeout, TimeUnit.SECONDS);
            }

            client.disconnect().get(5, TimeUnit.SECONDS);
            return ConnectionTestResult.success();
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            return classifyException(e);
        } finally {
            if (client != null) {
                try {
                    client.disconnect();
                } catch (Exception ignored) {
                    log.error(ExceptionUtils.getStackTrace(ignored));
                }
            }
        }
    }

    private ConnectionTestResult classifyException(Exception e) {
        String msg = e.getMessage() != null ? e.getMessage() : "";
        String rootMsg = getRootCauseMessage(e);

        if (e instanceof java.util.concurrent.TimeoutException || msg.contains("Timeout") || rootMsg.contains("Timeout")) {
            return ConnectionTestResult.fail("timeout", "连接超时，请检查服务地址和端口是否可达");
        }
        if (rootMsg.contains("not authorized") || rootMsg.contains("Bad user name or password")
                || (rootMsg.contains("CONNACK") && rootMsg.contains("5"))
                || rootMsg.contains("NOT_AUTHORIZED")) {
            return ConnectionTestResult.fail("authFailed", "认证失败，请检查用户名和密码");
        }
        if (rootMsg.contains("not permitted") || rootMsg.contains("denied") || rootMsg.contains("TOPIC")) {
            return ConnectionTestResult.fail("topicDenied", "主题无权限，请检查主题配置");
        }
        if (rootMsg.contains("Connection refused") || rootMsg.contains("UnknownHost")
                || rootMsg.contains("No route to host") || rootMsg.contains("Network is unreachable")) {
            return ConnectionTestResult.fail("unreachable", "服务不可达，请检查地址和端口");
        }
        return ConnectionTestResult.fail("configInvalid", "连接失败: " + sanitizeMessage(rootMsg));
    }

    private String getRootCauseMessage(Throwable t) {
        Throwable root = t;
        while (root.getCause() != null && root.getCause() != root) {
            root = root.getCause();
        }
        return root.getMessage() != null ? root.getMessage() : root.getClass().getSimpleName();
    }

    private String sanitizeMessage(String msg) {
        if (msg.length() > 200) {
            msg = msg.substring(0, 200);
        }
        return msg;
    }

    private void applySsl(Mqtt3ClientBuilder builder, String caCertPem) {
        if (StringUtils.isNotBlank(caCertPem)) {
            try {
                builder.sslConfig()
                        .trustManagerFactory(buildTrustManagerFactory(caCertPem))
                        .applySslConfig();
            } catch (Exception e) {
                log.error(ExceptionUtils.getStackTrace(e));
                builder.sslWithDefaultConfig();
            }
        } else {
            builder.sslWithDefaultConfig();
        }
    }

    private TrustManagerFactory buildTrustManagerFactory(String caCertPem) throws Exception {
        CertificateFactory certFactory = CertificateFactory.getInstance("X.509");
        X509Certificate cert = (X509Certificate) certFactory.generateCertificate(
                new ByteArrayInputStream(caCertPem.getBytes(StandardCharsets.UTF_8)));
        KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
        keyStore.load(null, null);
        keyStore.setCertificateEntry("ca", cert);
        TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        tmf.init(keyStore);
        return tmf;
    }
}

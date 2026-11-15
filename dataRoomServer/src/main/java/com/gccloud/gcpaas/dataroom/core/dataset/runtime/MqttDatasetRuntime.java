package com.gccloud.gcpaas.dataroom.core.dataset.runtime;

import com.gccloud.gcpaas.dataroom.core.constant.DatasetType;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import com.gccloud.gcpaas.dataroom.core.dataset.service.StreamingDatasetMessageProcessor;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.MqttDataset;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.MqttDatasource;
import com.gccloud.gcpaas.dataroom.core.dataset.ws.RealtimeDatasetSessionRegistry;
import com.hivemq.client.mqtt.MqttClient;
import com.hivemq.client.mqtt.mqtt3.Mqtt3AsyncClient;
import com.hivemq.client.mqtt.mqtt3.Mqtt3ClientBuilder;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.*;
import java.util.concurrent.TimeUnit;
import javax.net.ssl.TrustManagerFactory;

@Slf4j
public class MqttDatasetRuntime implements StreamingDatasetRuntime {

    private final String datasetCode;
    private final MqttDataset mqttDataset;
    private final MqttDatasource mqttDatasource;
    private final MqttLatestMessageCache cache;
    private final RealtimeDatasetSessionRegistry sessionRegistry;
    private final DatasetEntity datasetEntity;
    private final Map<String, Object> params;
    private final StreamingDatasetMessageProcessor messageProcessor;

    private Mqtt3AsyncClient client;
    private volatile boolean running = false;

    public MqttDatasetRuntime(DatasetEntity datasetEntity, Map<String, Object> params,
                              MqttDatasource mqttDatasource, StreamingDatasetMessageProcessor messageProcessor,
                              RealtimeDatasetSessionRegistry sessionRegistry) {
        this.datasetEntity = datasetEntity;
        this.datasetCode = datasetEntity.getCode();
        this.mqttDataset = (MqttDataset) datasetEntity.getDataset();
        this.params = params == null ? Map.of() : new HashMap<>(params);
        this.messageProcessor = messageProcessor;
        this.mqttDatasource = mqttDatasource;
        this.cache = new MqttLatestMessageCache(mqttDataset.getCacheSize() != null ? mqttDataset.getCacheSize() : 5);
        this.sessionRegistry = sessionRegistry;
    }

    @Override
    public String datasetCode() {
        return datasetCode;
    }

    @Override
    public DatasetType datasetType() {
        return DatasetType.MQTT;
    }

    @Override
    public void start() {
        if (running) return;
        try {
            String clientId = StringUtils.isNotBlank(mqttDatasource.getClientId())
                    ? mqttDatasource.getClientId() + "-ds-" + datasetCode.substring(0, Math.min(8, datasetCode.length()))
                    : "dataroom-ds-" + UUID.randomUUID().toString().substring(0, 12);

            Mqtt3ClientBuilder builder = MqttClient.builder()
                    .useMqttVersion3()
                    .identifier(clientId)
                    .serverHost(mqttDatasource.getHost())
                    .serverPort(mqttDatasource.getPort())
                    .automaticReconnectWithDefaultConfig();

            String protocol = mqttDatasource.getProtocol() != null ? mqttDatasource.getProtocol() : "tcp";
            String wsPath = StringUtils.isNotBlank(mqttDatasource.getPath()) ? mqttDatasource.getPath() : "";
            switch (protocol) {
                case "tls" -> applySsl(builder, mqttDatasource.getCaCertificate());
                case "ws" -> builder.webSocketConfig().serverPath(wsPath).applyWebSocketConfig();
                case "wss" -> {
                    applySsl(builder, mqttDatasource.getCaCertificate());
                    builder.webSocketConfig().serverPath(wsPath).applyWebSocketConfig();
                }
                default -> { }
            }

            if ("usernamePassword".equals(mqttDatasource.getAuthMode())) {
                builder.simpleAuth()
                        .username(mqttDatasource.getUsername())
                        .password(mqttDatasource.getPassword() != null ? mqttDatasource.getPassword().getBytes(StandardCharsets.UTF_8) : new byte[0])
                        .applySimpleAuth();
            }

            client = builder.buildAsync();

            int timeout = mqttDatasource.getConnectionTimeoutSeconds() != null ? mqttDatasource.getConnectionTimeoutSeconds() : 10;
            client.connect().get(timeout, TimeUnit.SECONDS);

            client.subscribeWith()
                    .topicFilter(mqttDataset.getTopic())
                    .callback(publish -> {
                        String payload = new String(publish.getPayloadAsBytes(), StandardCharsets.UTF_8);
                        handleMessage(payload);
                    })
                    .send()
                    .get(timeout, TimeUnit.SECONDS);

            running = true;
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            cache.setLastError("连接失败: " + e.getMessage());
        }
    }

    @Override
    public void stop() {
        running = false;
        if (client != null) {
            try {
                client.disconnect().get(5, TimeUnit.SECONDS);
            } catch (Exception e) {
                log.error(ExceptionUtils.getStackTrace(e));
            }
        }
        cache.clear();
    }

    @Override
    public boolean isRunning() {
        return running;
    }

    public MqttLatestMessageCache getCache() {
        return cache;
    }

    private void handleMessage(String payload) {
        try {
            StreamingDatasetMessageContext context = new StreamingDatasetMessageContext();
            context.setDatasetCode(datasetCode);
            context.setDatasetType(DatasetType.MQTT);
            context.setMessage(payload);
            context.setParams(params);
            context.getMetadata().put("topic", mqttDataset.getTopic());
            Object mapped = messageProcessor.process(datasetEntity, mqttDataset, context);
            cache.addMessage(mapped);

            if (sessionRegistry != null) {
                sessionRegistry.publishDatasetData(datasetCode, mapped);
            }
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            cache.setLastError("MQTT消息处理失败");
        }
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

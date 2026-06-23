package com.gccloud.gcpaas.dataroom.core.dataset.ws;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.dataroom.core.dataset.runtime.StreamingDatasetRuntimeManager;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 实时数据集订阅处理器。
 */
@Slf4j
@Component
public class RealtimeDatasetWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;

    private final RealtimeDatasetSessionRegistry sessionRegistry;

    private final StreamingDatasetRuntimeManager streamingDatasetRuntimeManager;

    @Autowired
    public RealtimeDatasetWebSocketHandler(
            ObjectMapper objectMapper,
            RealtimeDatasetSessionRegistry sessionRegistry,
            StreamingDatasetRuntimeManager streamingDatasetRuntimeManager
    ) {
        this.objectMapper = objectMapper;
        this.sessionRegistry = sessionRegistry;
        this.streamingDatasetRuntimeManager = streamingDatasetRuntimeManager;
    }

    public RealtimeDatasetWebSocketHandler() {
        this(new ObjectMapper(), new RealtimeDatasetSessionRegistry(new ObjectMapper()), null);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            RealtimeDatasetSubscriptionMessage subscriptionMessage = objectMapper.readValue(
                    message.getPayload(),
                    RealtimeDatasetSubscriptionMessage.class
            );
            if (!"subscribe".equals(subscriptionMessage.getType())) {
                return;
            }
            subscribe(session, subscriptionMessage);
        } catch (JsonProcessingException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            closeSession(session, CloseStatus.BAD_DATA);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        removeSession(session);
    }

    public void publishDatasetData(String datasetCode, Object data) {
        sessionRegistry.publishDatasetData(datasetCode, data);
    }

    private void subscribe(WebSocketSession session, RealtimeDatasetSubscriptionMessage subscriptionMessage) {
        removeSession(session);
        Set<String> datasetCodes = ConcurrentHashMap.newKeySet();
        Map<String, Map<String, Object>> paramMapByDatasetCode = new ConcurrentHashMap<>();

        if (subscriptionMessage.getDatasetCodes() != null) {
            subscriptionMessage.getDatasetCodes().stream()
                    .filter(Objects::nonNull)
                    .filter(datasetCode -> !datasetCode.isBlank())
                    .forEach(datasetCodes::add);
        }

        if (subscriptionMessage.getSubscriptions() != null) {
            for (RealtimeDatasetSubscriptionMessage.DatasetSubscription subscription : subscriptionMessage.getSubscriptions()) {
                if (subscription == null || subscription.getDatasetCode() == null || subscription.getDatasetCode().isBlank()) {
                    continue;
                }
                datasetCodes.add(subscription.getDatasetCode());
                paramMapByDatasetCode.put(subscription.getDatasetCode(), subscription.getParamMap());
            }
        }

        if (datasetCodes.isEmpty()) {
            return;
        }

        for (String datasetCode : datasetCodes) {
            if (streamingDatasetRuntimeManager != null) {
                streamingDatasetRuntimeManager.subscribe(datasetCode, paramMapByDatasetCode.get(datasetCode));
            }
        }
        sessionRegistry.register(session, datasetCodes);
    }

    private void removeSession(WebSocketSession session) {
        Set<String> datasetCodes = sessionRegistry.remove(session);
        for (String datasetCode : datasetCodes) {
            if (streamingDatasetRuntimeManager != null) {
                streamingDatasetRuntimeManager.unsubscribe(datasetCode);
            }
        }
    }

    private void closeSession(WebSocketSession session, CloseStatus status) {
        try {
            session.close(status);
        } catch (IOException e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
    }
}

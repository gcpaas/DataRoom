package com.gccloud.gcpaas.dataroom.core.dataset.ws;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 实时数据集订阅处理器。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RealtimeDatasetWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;

    private final Map<String, Set<WebSocketSession>> datasetSessionMap = new ConcurrentHashMap<>();

    private final Map<String, Set<String>> sessionDatasetMap = new ConcurrentHashMap<>();

    public RealtimeDatasetWebSocketHandler() {
        this(new ObjectMapper());
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
        Set<WebSocketSession> sessions = datasetSessionMap.getOrDefault(datasetCode, Collections.emptySet());
        if (sessions.isEmpty()) {
            return;
        }

        TextMessage message;
        try {
            message = new TextMessage(objectMapper.writeValueAsString(Map.of(
                    "type", "datasetData",
                    "datasetCode", datasetCode,
                    "data", data == null ? Collections.emptyList() : data
            )));
        } catch (JsonProcessingException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            return;
        }

        for (WebSocketSession session : sessions) {
            if (!session.isOpen()) {
                removeSession(session);
                continue;
            }
            try {
                session.sendMessage(message);
            } catch (IOException e) {
                log.error(ExceptionUtils.getStackTrace(e));
                removeSession(session);
            }
        }
    }

    private void subscribe(WebSocketSession session, RealtimeDatasetSubscriptionMessage subscriptionMessage) {
        removeSession(session);
        Set<String> datasetCodes = ConcurrentHashMap.newKeySet();

        if (subscriptionMessage.getDatasetCodes() != null) {
            subscriptionMessage.getDatasetCodes().stream()
                    .filter(Objects::nonNull)
                    .filter(datasetCode -> !datasetCode.isBlank())
                    .forEach(datasetCodes::add);
        }

        if (subscriptionMessage.getSubscriptions() != null) {
            subscriptionMessage.getSubscriptions().stream()
                    .map(RealtimeDatasetSubscriptionMessage.DatasetSubscription::getDatasetCode)
                    .filter(Objects::nonNull)
                    .filter(datasetCode -> !datasetCode.isBlank())
                    .forEach(datasetCodes::add);
        }

        if (datasetCodes.isEmpty()) {
            return;
        }

        sessionDatasetMap.put(session.getId(), datasetCodes);
        for (String datasetCode : datasetCodes) {
            datasetSessionMap.computeIfAbsent(datasetCode, key -> ConcurrentHashMap.newKeySet()).add(session);
        }
    }

    private void removeSession(WebSocketSession session) {
        Set<String> datasetCodes = sessionDatasetMap.remove(session.getId());
        if (datasetCodes == null) {
            return;
        }
        for (String datasetCode : datasetCodes) {
            Set<WebSocketSession> sessions = datasetSessionMap.get(datasetCode);
            if (sessions == null) {
                continue;
            }
            sessions.remove(session);
            if (sessions.isEmpty()) {
                datasetSessionMap.remove(datasetCode);
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

package com.gccloud.gcpaas.dataroom.core.dataset.ws;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 实时数据集前端订阅会话注册表。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RealtimeDatasetSessionRegistry {

    private final ObjectMapper objectMapper;

    private final Map<String, Set<WebSocketSession>> datasetSessionMap = new ConcurrentHashMap<>();

    private final Map<String, Set<String>> sessionDatasetMap = new ConcurrentHashMap<>();

    public void register(WebSocketSession session, Set<String> datasetCodes) {
        sessionDatasetMap.put(session.getId(), datasetCodes);
        for (String datasetCode : datasetCodes) {
            datasetSessionMap.computeIfAbsent(datasetCode, key -> ConcurrentHashMap.newKeySet()).add(session);
        }
    }

    public Set<String> remove(WebSocketSession session) {
        Set<String> datasetCodes = sessionDatasetMap.remove(session.getId());
        if (datasetCodes == null) {
            return Collections.emptySet();
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
        return datasetCodes;
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
                remove(session);
                continue;
            }
            try {
                session.sendMessage(message);
            } catch (IOException e) {
                log.error(ExceptionUtils.getStackTrace(e));
                remove(session);
            }
        }
    }
}

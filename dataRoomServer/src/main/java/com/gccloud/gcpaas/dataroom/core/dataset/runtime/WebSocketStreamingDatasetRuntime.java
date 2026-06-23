package com.gccloud.gcpaas.dataroom.core.dataset.runtime;

import com.gccloud.gcpaas.dataroom.core.constant.DatasetType;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.WebSocketDataset;
import com.gccloud.gcpaas.dataroom.core.dataset.service.StreamingDatasetMessageProcessor;
import com.gccloud.gcpaas.dataroom.core.dataset.ws.RealtimeDatasetSessionRegistry;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * WebSocket 流式数据集运行态。
 */
@Slf4j
public class WebSocketStreamingDatasetRuntime implements StreamingDatasetRuntime {

    private final DatasetEntity datasetEntity;

    private final WebSocketDataset webSocketDataset;

    private final Map<String, Object> params;

    private final StreamingDatasetMessageProcessor messageProcessor;

    private final RealtimeDatasetSessionRegistry sessionRegistry;

    private final StandardWebSocketClient webSocketClient = new StandardWebSocketClient();

    private final AtomicBoolean running = new AtomicBoolean(false);

    private WebSocketSession session;

    private CompletableFuture<WebSocketSession> connectFuture;

    public WebSocketStreamingDatasetRuntime(
            DatasetEntity datasetEntity,
            Map<String, Object> params,
            StreamingDatasetMessageProcessor messageProcessor,
            RealtimeDatasetSessionRegistry sessionRegistry
    ) {
        this.datasetEntity = datasetEntity;
        this.webSocketDataset = (WebSocketDataset) datasetEntity.getDataset();
        this.params = params;
        this.messageProcessor = messageProcessor;
        this.sessionRegistry = sessionRegistry;
    }

    @Override
    public String datasetCode() {
        return datasetEntity.getCode();
    }

    @Override
    public DatasetType datasetType() {
        return DatasetType.WEBSOCKET;
    }

    @Override
    public void start() {
        if (!running.compareAndSet(false, true)) {
            return;
        }
        connectFuture = webSocketClient.execute(new TextWebSocketHandler() {
            @Override
            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                handleExternalMessage(message.getPayload());
            }

            @Override
            public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
                running.set(false);
            }

            @Override
            public void handleTransportError(WebSocketSession session, Throwable exception) {
                log.error(ExceptionUtils.getStackTrace(exception));
                running.set(false);
            }
        }, webSocketDataset.getUrl());
        connectFuture.whenComplete((webSocketSession, throwable) -> {
            if (throwable != null) {
                log.error(ExceptionUtils.getStackTrace(throwable));
                running.set(false);
                return;
            }
            if (!running.get()) {
                closeSession(webSocketSession);
                return;
            }
            session = webSocketSession;
        });
    }

    @Override
    public void stop() {
        running.set(false);
        if (connectFuture != null && !connectFuture.isDone()) {
            connectFuture.cancel(true);
        }
        if (session == null || !session.isOpen()) {
            return;
        }
        closeSession(session);
    }

    @Override
    public boolean isRunning() {
        return running.get();
    }

    private void handleExternalMessage(String message) {
        try {
            StreamingDatasetMessageContext context = new StreamingDatasetMessageContext();
            context.setDatasetCode(datasetEntity.getCode());
            context.setDatasetType(DatasetType.WEBSOCKET);
            context.setMessage(message);
            context.getMetadata().put("url", webSocketDataset.getUrl());
            context.setParams(params);
            Object data = messageProcessor.process(datasetEntity, webSocketDataset, context);
            sessionRegistry.publishDatasetData(datasetEntity.getCode(), data);
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
    }

    private void closeSession(WebSocketSession webSocketSession) {
        try {
            webSocketSession.close();
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
    }
}

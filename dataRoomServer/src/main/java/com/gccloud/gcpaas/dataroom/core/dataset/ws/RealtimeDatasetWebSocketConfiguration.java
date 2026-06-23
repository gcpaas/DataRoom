package com.gccloud.gcpaas.dataroom.core.dataset.ws;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * 实时数据集 WebSocket 配置。
 */
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class RealtimeDatasetWebSocketConfiguration implements WebSocketConfigurer {

    public static final String SUBSCRIBE_ENDPOINT = "/dataRoom/dataset/ws/subscribe";

    private final RealtimeDatasetWebSocketHandler realtimeDatasetWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(realtimeDatasetWebSocketHandler, SUBSCRIBE_ENDPOINT)
                .setAllowedOriginPatterns("*");
    }
}

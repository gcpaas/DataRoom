package com.gccloud.gcpaas.core.dataset.ws;

import com.gccloud.gcpaas.dataroom.core.dataset.ws.RealtimeDatasetWebSocketConfiguration;
import com.gccloud.gcpaas.dataroom.core.dataset.ws.RealtimeDatasetWebSocketHandler;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistration;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.config.annotation.SockJsServiceRegistration;
import org.springframework.web.socket.server.HandshakeHandler;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;

class RealtimeDatasetWebSocketConfigurationTest {

    @Test
    void registersRealtimeDatasetSubscribeEndpoint() {
        RealtimeDatasetWebSocketHandler handler = new RealtimeDatasetWebSocketHandler();
        RealtimeDatasetWebSocketConfiguration configuration = new RealtimeDatasetWebSocketConfiguration(handler);
        RecordingWebSocketHandlerRegistry registry = new RecordingWebSocketHandlerRegistry();

        configuration.registerWebSocketHandlers(registry);

        assertEquals(List.of("/dataRoom/dataset/ws/subscribe"), registry.paths);
        assertSame(handler, registry.handler);
    }

    private static class RecordingWebSocketHandlerRegistry implements WebSocketHandlerRegistry {

        private final List<String> paths = new ArrayList<>();

        private WebSocketHandler handler;

        @Override
        public WebSocketHandlerRegistration addHandler(WebSocketHandler handler, String... paths) {
            this.handler = handler;
            this.paths.addAll(List.of(paths));
            return new RecordingWebSocketHandlerRegistration();
        }
    }

    private static class RecordingWebSocketHandlerRegistration implements WebSocketHandlerRegistration {

        @Override
        public WebSocketHandlerRegistration addHandler(WebSocketHandler handler, String... paths) {
            return this;
        }

        @Override
        public WebSocketHandlerRegistration addInterceptors(org.springframework.web.socket.server.HandshakeInterceptor... interceptors) {
            return this;
        }

        @Override
        public WebSocketHandlerRegistration setAllowedOrigins(String... origins) {
            return this;
        }

        @Override
        public WebSocketHandlerRegistration setAllowedOriginPatterns(String... originPatterns) {
            return this;
        }

        @Override
        public WebSocketHandlerRegistration setHandshakeHandler(HandshakeHandler handshakeHandler) {
            return this;
        }

        @Override
        public SockJsServiceRegistration withSockJS() {
            return null;
        }
    }
}

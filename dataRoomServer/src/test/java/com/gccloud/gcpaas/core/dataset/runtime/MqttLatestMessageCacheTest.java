package com.gccloud.gcpaas.core.dataset.runtime;

import com.gccloud.gcpaas.dataroom.core.dataset.runtime.MqttLatestMessageCache;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class MqttLatestMessageCacheTest {

    @Test
    void defaultCacheSizeIsFive() {
        MqttLatestMessageCache cache = new MqttLatestMessageCache(5);
        for (int i = 0; i < 7; i++) {
            cache.addMessage(Map.of("value", i));
        }
        assertEquals(5, cache.size());
        assertEquals(2, cache.getMessages().get(0).get("value"));
        assertEquals(6, cache.getMessages().get(4).get("value"));
    }

    @Test
    void removesOldestWhenExceedsLimit() {
        MqttLatestMessageCache cache = new MqttLatestMessageCache(3);
        cache.addMessage(Map.of("v", 1));
        cache.addMessage(Map.of("v", 2));
        cache.addMessage(Map.of("v", 3));
        cache.addMessage(Map.of("v", 4));

        assertEquals(3, cache.size());
        assertEquals(2, cache.getMessages().get(0).get("v"));
        assertEquals(4, cache.getMessages().get(2).get("v"));
    }

    @Test
    void emptyWhenNoMessages() {
        MqttLatestMessageCache cache = new MqttLatestMessageCache(5);
        assertTrue(cache.getMessages().isEmpty());
        assertEquals(0, cache.size());
        assertNull(cache.getLastMessageAt());
    }

    @Test
    void clearRemovesAllMessages() {
        MqttLatestMessageCache cache = new MqttLatestMessageCache(5);
        cache.addMessage(Map.of("v", 1));
        cache.addMessage(Map.of("v", 2));
        cache.clear();
        assertEquals(0, cache.size());
        assertNull(cache.getLastMessageAt());
    }

    @Test
    void lastMessageAtUpdatedOnAddMessage() {
        MqttLatestMessageCache cache = new MqttLatestMessageCache(5);
        assertNull(cache.getLastMessageAt());
        cache.addMessage(Map.of("v", 1));
        assertNotNull(cache.getLastMessageAt());
    }

    @Test
    void lastErrorTracking() {
        MqttLatestMessageCache cache = new MqttLatestMessageCache(5);
        assertNull(cache.getLastError());
        cache.setLastError("connection failed");
        assertEquals("connection failed", cache.getLastError());
        cache.addMessage(Map.of("v", 1));
        assertNull(cache.getLastError());
    }

    @Test
    void negativeCacheSizeDefaultsToFive() {
        MqttLatestMessageCache cache = new MqttLatestMessageCache(-1);
        for (int i = 0; i < 10; i++) {
            cache.addMessage(Map.of("v", i));
        }
        assertEquals(5, cache.size());
    }
}

package com.gccloud.gcpaas.dataroom.core.dataset.runtime;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class MqttLatestMessageCache {

    private final int maxSize;
    private final LinkedList<Map<String, Object>> messages = new LinkedList<>();
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
    private Instant lastMessageAt;
    private String lastError;

    public MqttLatestMessageCache(int maxSize) {
        this.maxSize = maxSize > 0 ? maxSize : 5;
    }

    public void addMessage(Map<String, Object> message) {
        lock.writeLock().lock();
        try {
            messages.addLast(message);
            if (messages.size() > maxSize) {
                messages.removeFirst();
            }
            lastMessageAt = Instant.now();
            lastError = null;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public List<Map<String, Object>> getMessages() {
        lock.readLock().lock();
        try {
            return new ArrayList<>(messages);
        } finally {
            lock.readLock().unlock();
        }
    }

    public void setLastError(String error) {
        lock.writeLock().lock();
        try {
            this.lastError = error;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public String getLastError() {
        lock.readLock().lock();
        try {
            return lastError;
        } finally {
            lock.readLock().unlock();
        }
    }

    public Instant getLastMessageAt() {
        lock.readLock().lock();
        try {
            return lastMessageAt;
        } finally {
            lock.readLock().unlock();
        }
    }

    public void clear() {
        lock.writeLock().lock();
        try {
            messages.clear();
            lastMessageAt = null;
            lastError = null;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public int size() {
        lock.readLock().lock();
        try {
            return messages.size();
        } finally {
            lock.readLock().unlock();
        }
    }
}

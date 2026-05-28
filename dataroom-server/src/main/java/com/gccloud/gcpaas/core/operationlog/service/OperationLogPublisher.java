package com.gccloud.gcpaas.core.operationlog.service;

import com.gccloud.gcpaas.core.operationlog.model.OperationLogContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.Executor;

@Slf4j
@RequiredArgsConstructor
public class OperationLogPublisher {

    private final Executor executor;
    private final OperationLogPersistService persistService;

    public void publish(OperationLogContext context) {
        if (context == null) {
            return;
        }
        OperationLogContext snapshot = context.snapshot();
        executor.execute(() -> {
            try {
                persistService.persist(snapshot);
            } catch (Exception e) {
                log.error("publish operation log failed", e);
            }
        });
    }
}

package com.gccloud.gcpaas.core.operationlog;

import com.gccloud.gcpaas.dataroom.core.operationlog.model.OperationLogContext;
import com.gccloud.gcpaas.dataroom.core.operationlog.service.OperationLogPersistService;
import com.gccloud.gcpaas.dataroom.core.operationlog.service.OperationLogPublisher;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.concurrent.Executor;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class OperationLogPublisherTest {

    @Test
    void publishUsesSnapshotBeforeAsyncDispatch() {
        OperationLogPersistService persistService = mock(OperationLogPersistService.class);
        Executor executor = Runnable::run;
        OperationLogPublisher publisher = new OperationLogPublisher(executor, persistService);

        OperationLogContext context = new OperationLogContext();
        context.setRequestUri("/dataRoom/dataset/run");

        publisher.publish(context);
        context.setRequestUri("/mutated");

        ArgumentCaptor<OperationLogContext> captor = ArgumentCaptor.forClass(OperationLogContext.class);
        verify(persistService).persist(captor.capture());
        assertNotSame(context, captor.getValue());
        assertEquals("/dataRoom/dataset/run", captor.getValue().getRequestUri());
    }
}

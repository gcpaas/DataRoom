package com.gccloud.gcpaas.core.dataset.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig;
import com.gccloud.gcpaas.dataroom.core.config.bean.Groovy;
import com.gccloud.gcpaas.dataroom.core.dataset.service.StreamingDatasetMessageProcessor;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;

class StreamingDatasetMessageProcessorTest {

    @Test
    void rejectsScriptWhenGroovyExecutionIsDisabledByDefault() {
        StreamingDatasetMessageProcessor processor = new StreamingDatasetMessageProcessor(new ObjectMapper(), new DataRoomConfig());

        DataRoomException exception = assertThrows(DataRoomException.class,
                () -> processor.process(null, "{\"value\":1}", "return payload", Map.of()));

        assertEquals("为了安全,默认关闭Groovy执行权限", exception.getMessage());
    }

    @Test
    void executesScriptWhenGroovyExecutionIsEnabled() {
        DataRoomConfig dataRoomConfig = new DataRoomConfig();
        Groovy groovy = new Groovy();
        groovy.setEnable(true);
        dataRoomConfig.setGroovy(groovy);
        StreamingDatasetMessageProcessor processor = new StreamingDatasetMessageProcessor(new ObjectMapper(), dataRoomConfig);

        Object result = processor.process(null, "{\"value\":1}", "return [payload.value, params.name]", Map.of("name", "demo"));

        assertEquals(List.of(1, "demo"), result);
    }

    @Test
    void returnsParsedPayloadWithoutScriptWhenGroovyExecutionIsDisabled() {
        StreamingDatasetMessageProcessor processor = new StreamingDatasetMessageProcessor(new ObjectMapper(), new DataRoomConfig());

        Object result = processor.process(null, "{\"value\":1}", "", Map.of());

        Map<?, ?> resultMap = assertInstanceOf(Map.class, result);
        assertEquals(1, resultMap.get("value"));
    }
}

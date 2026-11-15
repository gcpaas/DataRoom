package com.gccloud.gcpaas.core.dataset.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.dataroom.core.dataset.DatasetRunRequest;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.WebSocketDataset;
import com.gccloud.gcpaas.dataroom.core.dataset.runtime.StreamingDatasetMessageContext;
import com.gccloud.gcpaas.dataroom.core.dataset.runtime.WebSocketStreamingDatasetRuntime;
import com.gccloud.gcpaas.dataroom.core.dataset.service.StreamingDatasetMessageProcessor;
import com.gccloud.gcpaas.dataroom.core.dataset.service.WebSocketDatasetService;
import com.gccloud.gcpaas.dataroom.core.dataset.ws.RealtimeDatasetSessionRegistry;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.script.DisabledScriptExecutor;
import com.gccloud.gcpaas.dataroom.core.security.OutboundUrlSecurityService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class WebSocketDatasetProcessingTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private final StreamingDatasetMessageProcessor processor =
            new StreamingDatasetMessageProcessor(mapper, new DisabledScriptExecutor());

    private WebSocketDataset config(String fields) throws Exception {
        return mapper.readValue("{\"datasetType\":\"websocket\"," + fields + "}", WebSocketDataset.class);
    }

    @Test
    void jsonModeIgnoresSavedScriptEvenWhenExecutionIsDisabled() throws Exception {
        WebSocketDataset dataset = config("\"processingMode\":\"json\",\"script\":\"return payload\"");
        assertEquals(Map.of("value", 7), processor.process(null, dataset, "{\"value\":7}", Map.of()));
    }

    @Test
    void extractsNestedArrayInBothSampleAndRealtimePaths() throws Exception {
        WebSocketDataset dataset = config("\"processingMode\":\"json\",\"jsonPath\":\"$.data.rows\"");
        String message = "{\"data\":{\"rows\":[{\"value\":7},{\"value\":8}]}}";
        List<Map<String, Integer>> expected = List.of(Map.of("value", 7), Map.of("value", 8));
        assertEquals(expected, processor.process(null, dataset, message, Map.of()));
        StreamingDatasetMessageContext context = new StreamingDatasetMessageContext();
        context.setMessage(message);
        assertEquals(expected, processor.process(null, dataset, context));
    }

    @Test
    void supportsArrayIndexAndWildcardPaths() throws Exception {
        String message = "{\"rows\":[{\"value\":7},{\"value\":8}]}";
        assertEquals(Map.of("value", 7), processor.process(null,
                config("\"processingMode\":\"json\",\"jsonPath\":\"$.rows[0]\""), message, Map.of()));
        assertEquals(List.of(7, 8), processor.process(null,
                config("\"processingMode\":\"json\",\"jsonPath\":\"$.rows[*].value\""), message, Map.of()));
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "   ", "not-json", "{broken", "{} {}"})
    void rejectsMalformedMessagesInJsonMode(String message) throws Exception {
        WebSocketDataset dataset = config("\"processingMode\":\"json\"");
        assertThrows(DataRoomException.class, () -> processor.process(null, dataset, message, Map.of()));
    }

    @Test
    void rejectsMalformedJsonPath() throws Exception {
        WebSocketDataset dataset = config("\"processingMode\":\"json\",\"jsonPath\":\"$[\"");
        assertThrows(DataRoomException.class,
                () -> processor.process(null, dataset, "{\"value\":7}", Map.of()));
    }

    @Test
    void rejectsUnsupportedModeInsteadOfFallingBack() throws Exception {
        WebSocketDataset dataset = config("\"processingMode\":\"unsupported\"");
        assertThrows(DataRoomException.class,
                () -> processor.process(null, dataset, "{}", Map.of()));
    }

    @Test
    void requiresScriptInExplicitScriptMode() throws Exception {
        WebSocketDataset dataset = config("\"processingMode\":\"script\",\"script\":\"   \"");
        assertThrows(DataRoomException.class,
                () -> processor.process(null, dataset, "{}", Map.of()));
    }

    @Test
    void preservesScriptExecutionProtectionForLegacyAndExplicitModes() throws Exception {
        for (String fields : List.of("\"script\":\"return payload\"",
                "\"processingMode\":\"script\",\"script\":\"return payload\"")) {
            WebSocketDataset dataset = config(fields);
            DataRoomException error = assertThrows(DataRoomException.class,
                    () -> processor.process(null, dataset, "{}", Map.of()));
            assertTrue(error.getMessage().contains("默认关闭脚本执行权限"));
        }
    }

    @Test
    void defaultsToJsonWithoutScriptAndPreservesRootValues() throws Exception {
        WebSocketDataset dataset = config("\"script\":\"\"");
        assertEquals(List.of(Map.of("value", 7)),
                processor.process(null, dataset, "[{\"value\":7}]", Map.of()));
        assertNull(processor.process(null, dataset, "null", Map.of()));
        assertEquals(7, processor.process(null, dataset, "7", Map.of()));
    }

    @Test
    void missingPathReturnsNullAndBlankPathUsesWholeDocument() throws Exception {
        assertNull(processor.process(null, config("\"processingMode\":\"json\",\"jsonPath\":\"$.missing\""),
                "{\"value\":7}", Map.of()));
        assertEquals(Map.of("value", 7), processor.process(null,
                config("\"processingMode\":\"json\",\"jsonPath\":\"   \""), "{\"value\":7}", Map.of()));
    }

    @Test
    void explicitScriptModeIgnoresJsonPathAndKeepsRawMessageBindings() throws Exception {
        WebSocketDataset dataset = config("\"processingMode\":\"script\",\"jsonPath\":\"$[\",\"script\":\"return message\"");
        StreamingDatasetMessageProcessor scriptProcessor = new StreamingDatasetMessageProcessor(mapper,
                request -> request.bindings().get("message"));
        assertEquals("plain-text", scriptProcessor.process(null, dataset, "plain-text", Map.of()));
    }

    @Test
    void savedJsonConfigProducesSameDataInTestServiceAndRealtimePush() throws Exception {
        WebSocketDataset dataset = config("\"processingMode\":\"json\",\"jsonPath\":\"$.rows\",\"script\":\"return payload\"");
        dataset.setSampleData("{\"rows\":[{\"value\":7}]}");
        DatasetEntity entity = new DatasetEntity();
        entity.setCode("ws-json");
        entity.setDataset(dataset);
        // 模拟配置保存/读取，验证新增字段不会在序列化后丢失。
        DatasetEntity restored = mapper.readValue(mapper.writeValueAsString(entity), DatasetEntity.class);
        WebSocketDatasetService service = new WebSocketDatasetService();
        ReflectionTestUtils.setField(service, "streamingDatasetMessageProcessor", processor);
        assertEquals(List.of(Map.of("value", 7)), service.run(new DatasetRunRequest(), restored).getData());

        RealtimeDatasetSessionRegistry registry = new RealtimeDatasetSessionRegistry(mapper);
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.getId()).thenReturn("client");
        when(session.isOpen()).thenReturn(true);
        registry.register(session, Set.of("ws-json"));
        WebSocketStreamingDatasetRuntime runtime = new WebSocketStreamingDatasetRuntime(
                restored, Map.of(), processor, registry, mock(OutboundUrlSecurityService.class));
        ReflectionTestUtils.invokeMethod(runtime, "handleExternalMessage", dataset.getSampleData());

        ArgumentCaptor<TextMessage> sent = ArgumentCaptor.forClass(TextMessage.class);
        verify(session).sendMessage(sent.capture());
        assertEquals(mapper.readTree("{\"type\":\"datasetData\",\"datasetCode\":\"ws-json\",\"data\":[{\"value\":7}]}"),
                mapper.readTree(sent.getValue().getPayload()));
    }
}

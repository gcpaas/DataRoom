package com.gccloud.gcpaas.core.dataset.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.dataroom.core.dataset.DatasetRunRequest;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.MqttDataset;
import com.gccloud.gcpaas.dataroom.core.dataset.runtime.StreamingDatasetMessageContext;
import com.gccloud.gcpaas.dataroom.core.dataset.runtime.MqttDatasetRuntime;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.MqttDatasource;
import com.gccloud.gcpaas.dataroom.core.constant.DatasetType;
import com.gccloud.gcpaas.dataroom.core.dataset.service.StreamingDatasetMessageProcessor;
import com.gccloud.gcpaas.dataroom.core.dataset.service.MqttDatasetService;
import com.gccloud.gcpaas.dataroom.core.dataset.ws.RealtimeDatasetSessionRegistry;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.script.DisabledScriptExecutor;
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

class MqttDatasetProcessingTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private final StreamingDatasetMessageProcessor processor =
            new StreamingDatasetMessageProcessor(mapper, new DisabledScriptExecutor());

    private MqttDataset config(String fields) throws Exception {
        return mapper.readValue("{\"datasetType\":\"mqtt\"," + fields + "}", MqttDataset.class);
    }

    @Test
    void jsonModeIgnoresSavedScriptEvenWhenExecutionIsDisabled() throws Exception {
        MqttDataset dataset = config("\"processingMode\":\"json\",\"script\":\"return payload\"");
        assertEquals(Map.of("value", 7), processor.process(null, dataset, "{\"value\":7}", Map.of()));
    }

    @Test
    void extractsNestedArrayInBothSampleAndRealtimePaths() throws Exception {
        MqttDataset dataset = config("\"processingMode\":\"json\",\"jsonPath\":\"$.data.rows\"");
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
        MqttDataset dataset = config("\"processingMode\":\"json\"");
        assertThrows(DataRoomException.class, () -> processor.process(null, dataset, message, Map.of()));
    }

    @Test
    void rejectsMalformedJsonPath() throws Exception {
        MqttDataset dataset = config("\"processingMode\":\"json\",\"jsonPath\":\"$[\"");
        assertThrows(DataRoomException.class,
                () -> processor.process(null, dataset, "{\"value\":7}", Map.of()));
    }

    @Test
    void rejectsUnsupportedModeInsteadOfFallingBack() throws Exception {
        MqttDataset dataset = config("\"processingMode\":\"unsupported\"");
        assertThrows(DataRoomException.class,
                () -> processor.process(null, dataset, "{}", Map.of()));
    }

    @Test
    void requiresScriptInExplicitScriptMode() throws Exception {
        MqttDataset dataset = config("\"processingMode\":\"script\",\"script\":\"   \"");
        assertThrows(DataRoomException.class,
                () -> processor.process(null, dataset, "{}", Map.of()));
    }

    @Test
    void preservesScriptExecutionProtectionForLegacyAndExplicitModes() throws Exception {
        for (String fields : List.of("\"processingMode\":\"script\",\"script\":\"return payload\"")) {
            MqttDataset dataset = config(fields);
            DataRoomException error = assertThrows(DataRoomException.class,
                    () -> processor.process(null, dataset, "{}", Map.of()));
            assertTrue(error.getMessage().contains("默认关闭脚本执行权限"));
        }
    }

    @Test
    void defaultsToJsonWithoutScriptAndPreservesRootValues() throws Exception {
        MqttDataset dataset = config("\"processingMode\":\"json\"");
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
        MqttDataset dataset = config("\"processingMode\":\"script\",\"jsonPath\":\"$[\",\"script\":\"return message\"");
        StreamingDatasetMessageProcessor scriptProcessor = new StreamingDatasetMessageProcessor(mapper,
                request -> request.bindings().get("message"));
        assertEquals("plain-text", scriptProcessor.process(null, dataset, "plain-text", Map.of()));
    }

    @Test
    void legacyMappingsAreAppliedToSamples() throws Exception {
        MqttDataset dataset = config("\"jsonFieldMappings\":[{\"field\":\"temperature\",\"jsonPath\":\"$.data.value\"}]");
        assertEquals(Map.of("temperature", 7), processor.process(null, dataset,
                "{\"data\":{\"value\":7}}", Map.of()));
    }

    @ParameterizedTest
    @ValueSource(strings = {"json", "script", "legacy"})
    void savedConfigProducesSameSampleAndRealtimeData(String mode) throws Exception {
        MqttDataset dataset = config("\"topic\":\"sensor/data\"");
        dataset.setSampleData("{\"rows\":[{\"value\":7}]}");
        Object expected = List.of(Map.of("value", 7));
        StreamingDatasetMessageProcessor activeProcessor = processor;
        if ("legacy".equals(mode)) {
            MqttDataset.JsonFieldMapping mapping = new MqttDataset.JsonFieldMapping();
            mapping.setField("values");
            mapping.setJsonPath("$.rows");
            dataset.setJsonFieldMappings(List.of(mapping));
            expected = Map.of("values", List.of(Map.of("value", 7)));
        } else {
            dataset.setProcessingMode(mode);
            dataset.setJsonPath("$.rows");
            dataset.setScript("external-script");
            if ("script".equals(mode)) {
                // 外部脚本执行器通过 SPI 提供；检查消息和参数绑定及返回值传递。
                activeProcessor = new StreamingDatasetMessageProcessor(mapper, request -> {
                    assertEquals("external-script", request.script());
                    assertEquals("sensor/data", ((Map<?, ?>) request.bindings().get("metadata")).get("topic"));
                    assertEquals(Map.of("offset", 2), request.bindings().get("params"));
                    assertEquals(Map.of("rows", List.of(Map.of("value", 7))), request.bindings().get("payload"));
                    return "[{\"value\":9}]";
                });
                expected = List.of(Map.of("value", 9));
            }
        }
        DatasetEntity entity = new DatasetEntity();
        entity.setCode("mqtt-processing");
        entity.setDatasetType(DatasetType.MQTT);
        entity.setDataset(dataset);
        DatasetEntity restored = mapper.readValue(mapper.writeValueAsString(entity), DatasetEntity.class);
        MqttDatasetService service = new MqttDatasetService();
        ReflectionTestUtils.setField(service, "streamingDatasetMessageProcessor", activeProcessor);
        DatasetRunRequest request = new DatasetRunRequest();
        request.setInputParam(Map.of("offset", 2));
        assertEquals(expected, service.run(request, restored).getData());

        RealtimeDatasetSessionRegistry registry = new RealtimeDatasetSessionRegistry(mapper);
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.getId()).thenReturn("client");
        when(session.isOpen()).thenReturn(true);
        registry.register(session, Set.of(entity.getCode()));
        MqttDatasetRuntime runtime = new MqttDatasetRuntime(restored, Map.of("offset", 2),
                new MqttDatasource(), activeProcessor, registry);
        ReflectionTestUtils.invokeMethod(runtime, "handleMessage", dataset.getSampleData());
        ArgumentCaptor<TextMessage> sent = ArgumentCaptor.forClass(TextMessage.class);
        verify(session).sendMessage(sent.capture());
        assertEquals(mapper.valueToTree(expected), mapper.readTree(sent.getValue().getPayload()).get("data"));
        assertEquals(expected, runtime.getCache().getMessages().get(0));

        if ("json".equals(mode)) {
            ReflectionTestUtils.invokeMethod(runtime, "handleMessage", "not-json");
            verify(session, times(1)).sendMessage(any());
            assertEquals(1, runtime.getCache().size());
            assertNotNull(runtime.getCache().getLastError());
        }
    }
}

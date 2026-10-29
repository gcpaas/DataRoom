package com.gccloud.gcpaas.core.component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.InvalidTypeIdException;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.gccloud.gcpaas.dataroom.core.bean.KeyVal;
import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.constant.DatasetType;
import com.gccloud.gcpaas.dataroom.core.dataset.DatasetController;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.BaseDataset;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.DirectorDataset;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.HttpDataset;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.JsonDataset;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.mapper.DatasetMapper;
import com.gccloud.gcpaas.dataroom.core.mcp.SchemaInlineToolCallback;
import io.swagger.v3.oas.annotations.Operation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 数据集、目录新增和按 ID 更新的返回编码契约测试，不连接数据库或 MCP 服务。
 */
class DatasetMcpToolTest {

    private static final String DATASET_ID = "dataset-primary-key";
    private static final String REAL_CODE = "dataset-existing-code";
    private static final String FORGED_CODE = "dataset-forged-code";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private DatasetController controller;
    private DatasetMapper datasetMapper;

    @BeforeEach
    void setUp() {
        controller = new DatasetController();
        datasetMapper = mock(DatasetMapper.class);
        ReflectionTestUtils.setField(controller, "datasetMapper", datasetMapper);
    }

    @Test
    void insertDatasetIsMcpTool() throws NoSuchMethodException {
        Method method = DatasetController.class.getMethod("insert", DatasetEntity.class);

        assertNotNull(method.getAnnotation(Tool.class));
        assertEquals("insertDataset", method.getAnnotation(Tool.class).name());
        assertReturnsCodeDescription(method.getAnnotation(Tool.class).description());
    }

    @Test
    void updateDatasetIsMcpTool() throws NoSuchMethodException {
        Method method = DatasetController.class.getMethod("update", DatasetEntity.class);

        assertNotNull(method.getAnnotation(Tool.class));
        assertEquals("updateDataset", method.getAnnotation(Tool.class).name());
        assertReturnsCodeDescription(method.getAnnotation(Tool.class).description());
        assertTrue(method.getAnnotation(Tool.class).description().contains("按ID更新"));
    }

    @Test
    void getDatasetDetailIsMcpTool() throws NoSuchMethodException {
        Method method = DatasetController.class.getMethod("detail", String.class);

        assertNotNull(method.getAnnotation(Tool.class));
        assertEquals("getDatasetDetail", method.getAnnotation(Tool.class).name());
    }

    @ParameterizedTest
    @ValueSource(strings = {"insert", "update"})
    void openApiDocumentsReturnedCode(String methodName) throws NoSuchMethodException {
        Operation operation = DatasetController.class.getMethod(methodName, DatasetEntity.class)
                .getAnnotation(Operation.class);

        assertNotNull(operation);
        assertReturnsCodeDescription(operation.description());
    }

    @ParameterizedTest
    @EnumSource(value = DatasetType.class, names = {"JSON", "DIRECTORY"})
    void insertReturnsGeneratedCodeInsteadOfId(DatasetType type) {
        DatasetEntity request = dataset(type);
        request.setCode(FORGED_CODE);
        stubSuccessfulInsert();

        Resp<String> response = controller.insert(request);

        assertEquals(200, response.getCode());
        assertGeneratedCode(response.getData(), request);
        verify(datasetMapper).insert(request);
        verifyNoMoreInteractions(datasetMapper);
    }

    @ParameterizedTest
    @CsvSource({"JSON, 0", "DIRECTORY, 0", "JSON, 2", "DIRECTORY, 2"})
    void insertRequiresExactlyOneInsertedRow(DatasetType type, int affectedRows) {
        DatasetEntity request = dataset(type);
        when(datasetMapper.insert(any(DatasetEntity.class))).thenReturn(affectedRows);

        assertThrows(DataRoomException.class, () -> controller.insert(request));

        verify(datasetMapper).insert(request);
        verifyNoMoreInteractions(datasetMapper);
    }

    @ParameterizedTest
    @CsvSource({"JSON,", "JSON, dataset-forged-code", "DIRECTORY,", "DIRECTORY, dataset-forged-code"})
    void updateReturnsStoredCodeAndKeepsIdBasedUpdate(DatasetType type, String suppliedCode) {
        DatasetEntity request = dataset(type);
        request.setId(DATASET_ID);
        request.setCode(suppliedCode);
        stubSuccessfulUpdate(type);

        Resp<String> response = controller.update(request);

        assertEquals(200, response.getCode());
        assertEquals(REAL_CODE, response.getData());
        assertNotEquals(DATASET_ID, response.getData());
        assertEquals(DATASET_ID, request.getId());
        assertEquals(REAL_CODE, request.getCode());
        assertNotNull(request.getUpdateDate());
        verify(datasetMapper).selectById(DATASET_ID);
        verify(datasetMapper).updateById(request);
        verifyNoMoreInteractions(datasetMapper);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "\t\n"})
    void updateRejectsMissingIdBeforeAccessingMapper(String id) {
        DatasetEntity request = dataset(DatasetType.JSON);
        request.setId(id);
        request.setCode(REAL_CODE);

        assertThrows(IllegalArgumentException.class, () -> controller.update(request));

        verifyNoInteractions(datasetMapper);
    }

    @Test
    void updateRejectsMissingRecordWithoutWriting() {
        DatasetEntity request = dataset(DatasetType.DIRECTORY);
        request.setId(DATASET_ID);
        request.setCode(FORGED_CODE);
        when(datasetMapper.selectById(DATASET_ID)).thenReturn(null);

        assertThrows(DataRoomException.class, () -> controller.update(request));

        verify(datasetMapper).selectById(DATASET_ID);
        verify(datasetMapper, never()).updateById(any(DatasetEntity.class));
        verifyNoMoreInteractions(datasetMapper);
    }

    @ParameterizedTest
    @CsvSource({"JSON, 0", "DIRECTORY, 0", "JSON, 2", "DIRECTORY, 2"})
    void updateRequiresExactlyOneUpdatedRow(DatasetType type, int affectedRows) {
        DatasetEntity request = dataset(type);
        request.setId(DATASET_ID);
        request.setCode(FORGED_CODE);
        stubSuccessfulUpdate(type);
        when(datasetMapper.updateById(any(DatasetEntity.class))).thenReturn(affectedRows);

        assertThrows(DataRoomException.class, () -> controller.update(request));

        verify(datasetMapper).selectById(DATASET_ID);
        verify(datasetMapper).updateById(request);
        verifyNoMoreInteractions(datasetMapper);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {FORGED_CODE})
    void httpSensitiveHeadersArePreservedFromRecordSelectedById(String suppliedCode) {
        DatasetEntity stored = dataset(DatasetType.HTTP);
        stored.setId(DATASET_ID);
        stored.setCode(REAL_CODE);
        HttpDataset storedHttp = new HttpDataset();
        storedHttp.setHeaderList(List.of(
                header("Authorization", "original-authorization", true),
                header("X-Api-Key", "original-api-key", true),
                header("X-Null-Key", "original-null-key", true),
                header("X-Replaced", "old-replaced-value", true),
                header("X-Public", "old-public-value", false)));
        stored.setDataset(storedHttp);
        when(datasetMapper.selectById(DATASET_ID)).thenReturn(stored);
        when(datasetMapper.updateById(any(DatasetEntity.class))).thenReturn(1);

        DatasetEntity request = dataset(DatasetType.HTTP);
        request.setId(DATASET_ID);
        request.setCode(suppliedCode);
        HttpDataset requestedHttp = new HttpDataset();
        requestedHttp.setHeaderList(List.of(
                header(" authorization ", "******", true),
                header("x-api-key", "", true),
                header("X-Null-Key", null, true),
                header("X-Replaced", "new-secret", true),
                header("X-Public", "new-public-value", false)));
        request.setDataset(requestedHttp);

        Resp<String> response = controller.update(request);

        assertEquals(REAL_CODE, response.getData());
        ArgumentCaptor<DatasetEntity> captor = ArgumentCaptor.forClass(DatasetEntity.class);
        verify(datasetMapper).selectById(DATASET_ID);
        verify(datasetMapper).updateById(captor.capture());
        DatasetEntity written = captor.getValue();
        assertEquals(DATASET_ID, written.getId());
        assertEquals(REAL_CODE, written.getCode());
        HttpDataset writtenHttp = (HttpDataset) written.getDataset();
        assertEquals(List.of("original-authorization", "original-api-key", "original-null-key",
                        "new-secret", "new-public-value"),
                writtenHttp.getHeaderList().stream().map(KeyVal::getVal).toList());
        assertEquals("old-replaced-value", storedHttp.getHeaderList().get(3).getVal());
        verify(datasetMapper, never()).getByCode(anyString());
        verifyNoMoreInteractions(datasetMapper);
    }

    @ParameterizedTest
    @EnumSource(value = DatasetType.class, names = {"JSON", "DIRECTORY"})
    void insertMcpCallbackSerializesGeneratedCode(DatasetType type) throws Exception {
        stubSuccessfulInsert();
        ObjectNode request = requestJson(type, null, FORGED_CODE);
        ToolCallback callback = toolCallback("insertDataset");

        String result = callback.call(objectMapper.createObjectNode()
                .set("datasetEntity", request).toString());

        ArgumentCaptor<DatasetEntity> captor = ArgumentCaptor.forClass(DatasetEntity.class);
        verify(datasetMapper).insert(captor.capture());
        assertEquals(type, captor.getValue().getDatasetType());
        if (type == DatasetType.JSON) {
            assertTrue(captor.getValue().getDataset() instanceof JsonDataset);
            assertEquals("[{\"value\":1}]", ((JsonDataset) captor.getValue().getDataset()).getJson());
        } else {
            assertEquals(null, captor.getValue().getDataset(), "目录不需要数据集配置");
        }
        assertGeneratedCode(serializedResponseData(result), captor.getValue());
        assertReturnsCodeDescription(callback.getToolDefinition().description());
        verifyNoMoreInteractions(datasetMapper);
    }

    @ParameterizedTest
    @CsvSource({"JSON,", "JSON, dataset-forged-code", "DIRECTORY,", "DIRECTORY, dataset-forged-code"})
    void updateMcpCallbackSerializesStoredCode(DatasetType type, String suppliedCode) throws Exception {
        stubSuccessfulUpdate(type);
        ToolCallback callback = toolCallback("updateDataset");

        String result = callback.call(objectMapper.createObjectNode()
                .set("datasetEntity", requestJson(type, DATASET_ID, suppliedCode)).toString());

        assertEquals(REAL_CODE, serializedResponseData(result));
        assertReturnsCodeDescription(callback.getToolDefinition().description());
        verifyUpdatedRecord(type);
    }

    @ParameterizedTest
    @EnumSource(value = DatasetType.class, names = {"JSON", "DIRECTORY"})
    void insertRestResponseContainsGeneratedCode(DatasetType type) throws Exception {
        stubSuccessfulInsert();
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        String result = mockMvc.perform(post("/dataRoom/dataset/insert")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson(type, null, FORGED_CODE).toString()))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();

        ArgumentCaptor<DatasetEntity> captor = ArgumentCaptor.forClass(DatasetEntity.class);
        verify(datasetMapper).insert(captor.capture());
        assertEquals(type, captor.getValue().getDatasetType());
        assertGeneratedCode(serializedResponseData(result), captor.getValue());
        verifyNoMoreInteractions(datasetMapper);
    }

    @ParameterizedTest
    @CsvSource({"JSON,", "JSON, dataset-forged-code", "DIRECTORY,", "DIRECTORY, dataset-forged-code"})
    void updateRestResponseContainsStoredCode(DatasetType type, String suppliedCode) throws Exception {
        stubSuccessfulUpdate(type);
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        String result = mockMvc.perform(post("/dataRoom/dataset/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson(type, DATASET_ID, suppliedCode).toString()))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();

        assertEquals(REAL_CODE, serializedResponseData(result));
        verifyUpdatedRecord(type);
    }

    @ParameterizedTest
    @EnumSource(DatasetType.class)
    void datasetEntityEnumKeepsExistingWireAndStorageValues(DatasetType type) throws Exception {
        DatasetEntity entity = objectMapper.readValue("{\"datasetType\":\"" + type.getType() + "\"}",
                DatasetEntity.class);
        assertEquals(type, entity.getDatasetType());
        assertEquals(type.getType(), objectMapper.readTree(objectMapper.writeValueAsString(entity))
                .path("datasetType").asText());
        assertEquals(type.getType(), type.getValue(), "数据库存储值不应改变");
    }

    @ParameterizedTest
    @ValueSource(strings = {"JSON", "unregistered"})
    void restStillRejectsInvalidOuterTypeWithoutWriting(String type) throws Exception {
        ObjectNode request = requestJson(DatasetType.JSON, null, null);
        request.put("datasetType", type);
        MockMvcBuilders.standaloneSetup(controller).build()
                .perform(post("/dataRoom/dataset/insert")
                        .contentType(MediaType.APPLICATION_JSON).content(request.toString()))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(datasetMapper);
    }

    @Test
    void directoryAndJsonUseDistinctPolymorphicTypes() throws Exception {
        BaseDataset directory = objectMapper.readValue("{\"datasetType\":\"directory\"}", BaseDataset.class);
        assertEquals(DirectorDataset.class, directory.getClass());
        BaseDataset json = objectMapper.readValue("{\"datasetType\":\"json\",\"json\":\"[]\"}", BaseDataset.class);
        assertEquals(JsonDataset.class, json.getClass());
        assertEquals("[]", ((JsonDataset) json).getJson());
        assertEquals("json", objectMapper.readTree(objectMapper.writeValueAsString(json))
                .path("datasetType").asText(), "JSON 配置序列化不能变为目录类型");
        assertEquals("directory", objectMapper.readTree(objectMapper.writeValueAsString(directory))
                .path("datasetType").asText());
    }

    @Test
    void unregisteredDatasetTypeIsRejected() {
        assertThrows(InvalidTypeIdException.class, () -> objectMapper.readValue(
                "{\"datasetType\":\"unregistered\"}", BaseDataset.class));
        verifyNoInteractions(datasetMapper);
    }

    private DatasetEntity dataset(DatasetType type) {
        DatasetEntity entity = new DatasetEntity();
        entity.setName("编码契约测试");
        entity.setDatasetType(type);
        entity.setParentCode("root");
        if (type == DatasetType.JSON) {
            JsonDataset json = new JsonDataset();
            json.setJson("[{\"value\":1}]");
            entity.setDataset(json);
        }
        return entity;
    }

    private void stubSuccessfulInsert() {
        when(datasetMapper.insert(any(DatasetEntity.class))).thenAnswer(invocation -> {
            DatasetEntity inserted = invocation.getArgument(0);
            assertNotNull(inserted.getCode());
            assertFalse(inserted.getCode().isBlank());
            assertNotEquals(FORGED_CODE, inserted.getCode());
            inserted.setId(DATASET_ID);
            return 1;
        });
    }

    private void stubSuccessfulUpdate(DatasetType type) {
        DatasetEntity stored = dataset(type);
        stored.setId(DATASET_ID);
        stored.setCode(REAL_CODE);
        when(datasetMapper.selectById(DATASET_ID)).thenReturn(stored);
        when(datasetMapper.updateById(any(DatasetEntity.class))).thenReturn(1);
    }

    private void verifyUpdatedRecord(DatasetType type) {
        ArgumentCaptor<DatasetEntity> captor = ArgumentCaptor.forClass(DatasetEntity.class);
        verify(datasetMapper).selectById(DATASET_ID);
        verify(datasetMapper).updateById(captor.capture());
        assertEquals(DATASET_ID, captor.getValue().getId());
        assertEquals(REAL_CODE, captor.getValue().getCode());
        assertEquals(type, captor.getValue().getDatasetType());
        verifyNoMoreInteractions(datasetMapper);
    }

    private ObjectNode requestJson(DatasetType type, String id, String code) {
        ObjectNode request = objectMapper.createObjectNode();
        request.put("name", "编码契约测试");
        request.put("datasetType", type.getType());
        request.put("parentCode", "root");
        if (id != null) {
            request.put("id", id);
        }
        if (code != null) {
            request.put("code", code);
        }
        if (type == DatasetType.JSON) {
            request.putObject("dataset").put("datasetType", "json").put("json", "[{\"value\":1}]");
        }
        return request;
    }

    private ToolCallback toolCallback(String name) {
        return Arrays.stream(MethodToolCallbackProvider.builder().toolObjects(controller).build().getToolCallbacks())
                .filter(callback -> name.equals(callback.getToolDefinition().name()))
                .map(SchemaInlineToolCallback::new)
                .findFirst().orElseThrow();
    }

    private String serializedResponseData(String result) throws Exception {
        JsonNode response = objectMapper.readTree(result);
        assertEquals(200, response.path("code").asInt());
        assertTrue(response.path("data").isTextual(), "Resp.data 应序列化为编码字符串");
        return response.path("data").asText();
    }

    private void assertGeneratedCode(String returnedCode, DatasetEntity inserted) {
        assertNotNull(returnedCode);
        assertFalse(returnedCode.isBlank());
        assertEquals(inserted.getCode(), returnedCode);
        assertNotEquals(DATASET_ID, returnedCode);
        assertNotEquals(FORGED_CODE, returnedCode);
    }

    private void assertReturnsCodeDescription(String description) {
        assertTrue(description.matches("(?s).*返回[^；。]*(编码|code).*"), "描述应明确返回编码：" + description);
        assertFalse(description.contains("返回数据集ID"), "描述不应继续宣称返回数据集ID");
    }

    private KeyVal header(String key, String value, boolean encrypted) {
        KeyVal header = new KeyVal();
        header.setKey(key);
        header.setVal(value);
        header.setEncrypted(encrypted);
        return header;
    }
}

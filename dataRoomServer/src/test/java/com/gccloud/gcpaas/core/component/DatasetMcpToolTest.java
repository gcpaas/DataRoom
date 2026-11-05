package com.gccloud.gcpaas.core.component;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.MybatisMapperBuilderAssistant;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
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
import com.gccloud.gcpaas.dataroom.core.mcp.ToolSchemaInlineSupport;
import io.swagger.v3.oas.annotations.Operation;
import org.junit.jupiter.api.BeforeAll;
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
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
 * 数据集、目录新增和按 code 更新的返回编码契约测试，不连接数据库或 MCP 服务。
 */
class DatasetMcpToolTest {

    private static final String DATASET_ID = "dataset-primary-key";
    private static final String FORGED_ID = "dataset-forged-id";
    private static final String REAL_CODE = "dataset-existing-code";
    private static final String FORGED_CODE = "dataset-forged-code";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private DatasetController controller;
    private DatasetMapper datasetMapper;

    @BeforeAll
    static void initTableInfo() {
        TableInfoHelper.initTableInfo(new MybatisMapperBuilderAssistant(new MybatisConfiguration(), ""),
                DatasetEntity.class);
    }

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
        assertTrue(method.getAnnotation(Tool.class).description().contains("按code更新"));
        assertFalse(method.getAnnotation(Tool.class).description().contains("按ID更新"));
    }

    @Test
    void updateMcpSchemaKeepsOptionalIdAndRequiresCode() throws Exception {
        JsonNode schema = objectMapper.readTree(toolCallback("updateDataset").getToolDefinition().inputSchema());
        JsonNode entity = schema.path("properties").path("datasetEntity");

        assertTrue(entity.path("properties").isObject());
        assertTrue(entity.path("properties").has("id"), "更新工具保留可选的数据库主键属性");
        assertTrue(entity.path("properties").has("code"));
        assertTrue(entity.path("required").isArray());
        assertFalse(entity.path("required").toString().contains("\"id\""));
        assertTrue(entity.path("required").toString().contains("\"code\""), "更新必须传 code");
        verifyNoInteractions(datasetMapper);
    }

    @Test
    void insertMcpSchemaKeepsExistingIdAndRequiredFields() throws Exception {
        ToolCallback raw = Arrays.stream(MethodToolCallbackProvider.builder().toolObjects(controller)
                        .build().getToolCallbacks())
                .filter(callback -> "insertDataset".equals(callback.getToolDefinition().name()))
                .findFirst().orElseThrow();
        JsonNode original = objectMapper.readTree(ToolSchemaInlineSupport.inlineRefs(
                raw.getToolDefinition().inputSchema()));
        JsonNode normalized = objectMapper.readTree(new SchemaInlineToolCallback(raw)
                .getToolDefinition().inputSchema());
        JsonNode originalEntity = original.path("properties").path("datasetEntity");
        JsonNode normalizedEntity = normalized.path("properties").path("datasetEntity");

        assertTrue(originalEntity.path("properties").has("id"));
        assertEquals(originalEntity.path("properties").path("id").path("type"),
                normalizedEntity.path("properties").path("id").path("type"));
        assertTrue(normalizedEntity.path("properties").has("id"));
        assertEquals(originalEntity.path("properties").path("code"),
                normalizedEntity.path("properties").path("code"));
        assertEquals(objectMapper.valueToTree(List.of("datasetType", "name", "parentCode")),
                normalizedEntity.path("required"), "新增不要求 code 或服务端字段");
        verifyNoInteractions(datasetMapper);
    }

    @ParameterizedTest
    @ValueSource(strings = {"updateDataset", "insertDataset"})
    void schemaNormalizationKeepsIdAndOnlyRelaxesEntityLevelRequired(String toolName) throws Exception {
        String input = """
                {"type":"object","properties":{
                  "datasetEntity":{"type":"object","properties":{
                    "id":{"type":"string"},"code":{"type":"string"},
                    "datasetType":{"type":"string","enum":["JSON"]},
                    "dataset":{"type":"object","properties":{"id":{"type":"string"}},"required":["id"]}
                  },"required":["id","code","datasetType","dataset"]},
                  "id":{"type":"string"}
                },"required":["datasetEntity","id"]}
                """;
        ObjectNode expected = (ObjectNode) objectMapper.readTree(input);
        ObjectNode entity = (ObjectNode) expected.path("properties").path("datasetEntity");
        ObjectNode type = (ObjectNode) entity.path("properties").path("datasetType");
        var values = type.putArray("enum");
        for (DatasetType datasetType : DatasetType.values()) {
            values.add(datasetType.getType());
        }
        ((ObjectNode) entity.path("properties").path("id")).put("description",
                "updateDataset".equals(toolName)
                        ? "主键，可省略；服务端按 code 查询真实主键并覆盖传入值"
                        : "主键，可省略；未提供时由持久化层生成，传入非空值不会在新增入口清除");
        entity.putArray("required").add("code").add("datasetType").add("dataset");

        JsonNode actual = objectMapper.readTree(ToolSchemaInlineSupport.normalizeInputSchema(toolName, input));

        assertEquals(expected, actual,
                "只调整实体顶层主键的必填和描述，保留属性、嵌套必填及工具根级必填");
        verifyNoInteractions(datasetMapper);
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
    @CsvSource({"JSON,", "JSON, dataset-forged-id", "JSON, dataset-primary-key",
            "DIRECTORY,", "DIRECTORY, dataset-forged-id", "DIRECTORY, dataset-primary-key"})
    void updateUsesCodeToResolveStoredIdAndReturnsStoredCode(DatasetType type, String suppliedId) {
        DatasetEntity request = dataset(type);
        request.setId(suppliedId);
        request.setCode(REAL_CODE);
        stubSuccessfulUpdate(type);

        Resp<String> response = controller.update(request);

        assertEquals(200, response.getCode());
        assertEquals(REAL_CODE, response.getData());
        assertNotEquals(DATASET_ID, response.getData());
        assertEquals(DATASET_ID, request.getId());
        assertEquals(REAL_CODE, request.getCode());
        assertNotNull(request.getUpdateDate());
        verifySelectedByCode(REAL_CODE);
        verify(datasetMapper).updateById(request);
        verifyNoMoreInteractions(datasetMapper);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "\t\n"})
    void updateRejectsMissingCodeEvenWithIdBeforeAccessingMapper(String code) {
        for (DatasetType type : List.of(DatasetType.JSON, DatasetType.DIRECTORY)) {
            DatasetEntity request = dataset(type);
            request.setId(DATASET_ID);
            request.setCode(code);

            assertThrows(IllegalArgumentException.class, () -> controller.update(request));

            verifyNoInteractions(datasetMapper);
        }
    }

    @ParameterizedTest
    @EnumSource(value = DatasetType.class, names = {"JSON", "DIRECTORY"})
    void updateRejectsMissingRecordWithoutWriting(DatasetType type) {
        DatasetEntity request = dataset(type);
        request.setId(DATASET_ID);
        request.setCode(FORGED_CODE);
        when(datasetMapper.selectOne(any())).thenReturn(null);

        assertThrows(DataRoomException.class, () -> controller.update(request));

        verifySelectedByCode(FORGED_CODE);
        verify(datasetMapper, never()).updateById(any(DatasetEntity.class));
        verifyNoMoreInteractions(datasetMapper);
    }

    @ParameterizedTest
    @CsvSource({"JSON, 0", "DIRECTORY, 0", "JSON, 2", "DIRECTORY, 2"})
    void updateRequiresExactlyOneUpdatedRow(DatasetType type, int affectedRows) {
        DatasetEntity request = dataset(type);
        request.setId(FORGED_ID);
        request.setCode(REAL_CODE);
        stubSuccessfulUpdate(type);
        when(datasetMapper.updateById(any(DatasetEntity.class))).thenReturn(affectedRows);

        assertThrows(DataRoomException.class, () -> controller.update(request));

        verifySelectedByCode(REAL_CODE);
        verify(datasetMapper).updateById(request);
        verifyNoMoreInteractions(datasetMapper);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {FORGED_ID, DATASET_ID})
    void httpSensitiveHeadersArePreservedFromRecordSelectedByCode(String suppliedId) {
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
        when(datasetMapper.selectOne(any())).thenReturn(stored);
        when(datasetMapper.updateById(any(DatasetEntity.class))).thenReturn(1);

        DatasetEntity request = dataset(DatasetType.HTTP);
        request.setId(suppliedId);
        request.setCode(REAL_CODE);
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
        verifySelectedByCode(REAL_CODE);
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
    @CsvSource({"JSON,", "JSON, dataset-forged-id", "JSON, dataset-primary-key",
            "DIRECTORY,", "DIRECTORY, dataset-forged-id", "DIRECTORY, dataset-primary-key"})
    void updateMcpCallbackSerializesStoredCode(DatasetType type, String suppliedId) throws Exception {
        stubSuccessfulUpdate(type);
        ToolCallback callback = toolCallback("updateDataset");

        String result = callback.call(objectMapper.createObjectNode()
                .set("datasetEntity", requestJson(type, suppliedId, REAL_CODE)).toString());

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
    @CsvSource({"JSON,", "JSON, dataset-forged-id", "JSON, dataset-primary-key",
            "DIRECTORY,", "DIRECTORY, dataset-forged-id", "DIRECTORY, dataset-primary-key"})
    void updateRestResponseContainsStoredCode(DatasetType type, String suppliedId) throws Exception {
        stubSuccessfulUpdate(type);
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        String result = mockMvc.perform(post("/dataRoom/dataset/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson(type, suppliedId, REAL_CODE).toString()))
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
        when(datasetMapper.selectOne(any())).thenReturn(stored);
        when(datasetMapper.updateById(any(DatasetEntity.class))).thenReturn(1);
    }

    @SuppressWarnings("unchecked")
    private void verifySelectedByCode(String code) {
        ArgumentCaptor<LambdaQueryWrapper<DatasetEntity>> captor =
                ArgumentCaptor.forClass(LambdaQueryWrapper.class);
        verify(datasetMapper).selectOne(captor.capture());
        LambdaQueryWrapper<DatasetEntity> query = captor.getValue();
        Matcher condition = Pattern.compile("\\(code = #\\{ew\\.paramNameValuePairs\\.(\\w+)\\}\\)")
                .matcher(query.getSqlSegment());
        assertTrue(condition.matches(), "查询必须仅包含 code 等值条件：" + query.getSqlSegment());
        assertEquals(Map.of(condition.group(1), code), query.getParamNameValuePairs(),
                "查询绑定值必须是请求 code，不能使用请求 id 或固定编码");
        assertEquals(null, query.getEntity(), "不能通过实体附带额外查询条件");
    }

    private void verifyUpdatedRecord(DatasetType type) {
        ArgumentCaptor<DatasetEntity> captor = ArgumentCaptor.forClass(DatasetEntity.class);
        verifySelectedByCode(REAL_CODE);
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

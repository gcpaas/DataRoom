package com.gccloud.gcpaas.core.component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.gccloud.gcpaas.dataroom.core.entity.BaseEntity;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import com.gccloud.gcpaas.dataroom.core.entity.PageEntity;
import com.gccloud.gcpaas.dataroom.core.entity.PageStageEntity;
import org.springframework.ai.util.json.schema.JsonSchemaGenerator;
import com.gccloud.gcpaas.dataroom.core.dataset.DatasetController;
import com.gccloud.gcpaas.dataroom.core.constant.DatasetType;
import com.gccloud.gcpaas.dataroom.core.mcp.SchemaInlineToolCallback;
import com.gccloud.gcpaas.dataroom.core.mcp.ToolSchemaInlineSupport;
import com.gccloud.gcpaas.dataroom.core.page.PageController;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * MCP 工具 inputSchema 的 $ref 内联契约测试。
 * 多态类型（BaseDataset/BasePageConfig）生成的 $defs/$ref 引用对不解析引用的
 * MCP 客户端（AgentScope 等）不可用，注册前必须完成内联展开。
 */
class McpToolSchemaContractTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Test
    void mcpToolSchemasDoNotContainRefs() {
        ToolCallback[] callbacks = MethodToolCallbackProvider.builder()
                .toolObjects(new DatasetController(), new PageController())
                .build()
                .getToolCallbacks();
        assertTrue(callbacks.length > 0, "应存在MCP工具");
        for (ToolCallback callback : callbacks) {
            String schema = new SchemaInlineToolCallback(callback).getToolDefinition().inputSchema();
            assertNotNull(schema, callback.getToolDefinition().name() + " schema 为空");
            assertFalse(schema.contains("$ref"), callback.getToolDefinition().name() + " 的 schema 仍包含 $ref");
            assertFalse(schema.contains("$defs"), callback.getToolDefinition().name() + " 的 schema 仍包含 $defs");
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"insertDataset", "updateDataset"})
    void datasetSchemaKeepsJsonDiscriminatorAfterInline(String toolName) throws Exception {
        String schema = toolSchema(toolName);
        assertNotNull(schema, toolName + " 工具不存在");
        JsonNode dataset = MAPPER.readTree(schema).path("properties").path("datasetEntity")
                .path("properties").path("dataset");
        // 必须检查多态分支的 const，外层枚举或 json 字段名出现不代表 JSON 类型可用。
        JsonNode jsonBranch = findDatasetBranch(dataset, "json");
        assertNotNull(jsonBranch, toolName + " 缺少 datasetType=json 的配置分支：" + dataset);
        assertEquals("string", jsonBranch.path("properties").path("json").path("type").asText());
        assertNotNull(findDatasetBranch(dataset, "directory"), "缺少 directory 配置分支");
        assertNotNull(findDatasetBranch(dataset, "http"), "缺少 http 配置分支");
    }

    @ParameterizedTest
    @ValueSource(strings = {"insertDataset", "updateDataset"})
    void datasetTypeEnumMatchesJacksonWireValues(String toolName) throws Exception {
        JsonNode typeSchema = MAPPER.readTree(toolSchema(toolName)).path("properties")
                .path("datasetEntity").path("properties").path("datasetType");
        assertEquals("string", typeSchema.path("type").asText());
        assertEquals(MAPPER.valueToTree(Arrays.stream(DatasetType.values())
                .map(DatasetType::getType).toList()), typeSchema.path("enum"),
                "MCP 外层枚举必须与 REST/Jackson 的小写值一致");
    }

    private JsonNode findDatasetBranch(JsonNode node, String type) {
        if (type.equals(node.path("properties").path("datasetType").path("const").asText())) {
            return node;
        }
        for (JsonNode child : node) {
            JsonNode result = findDatasetBranch(child, type);
            if (result != null) {
                return result;
            }
        }
        return null;
    }

    @Test
    void updatePageConfigSchemaKeepsPageTypesAfterInline() throws Exception {
        JsonNode config = MAPPER.readTree(toolSchema("updatePageConfig")).path("properties")
                .path("pageStage").path("properties").path("pageConfig");
        for (String type : List.of("page", "visualScreen", "directory")) {
            JsonNode branch = findDiscriminatorBranch(config, "pageType", type);
            assertNotNull(branch, "缺少页面类型分支：" + type);
            assertTrue(requiredFields(branch).contains("pageType"), "内层判别字段仍必填");
            for (String field : List.of("basicConfig", "chartList", "globalVariableList")) {
                assertTrue(branch.path("properties").has(field), type + " 缺少 " + field);
            }
        }
    }

    private JsonNode findDiscriminatorBranch(JsonNode node, String discriminator, String type) {
        if (type.equals(node.path("properties").path(discriminator).path("const").asText())) {
            return node;
        }
        for (JsonNode child : node) {
            JsonNode result = findDiscriminatorBranch(child, discriminator, type);
            if (result != null) {
                return result;
            }
        }
        return null;
    }

    @Test
    void normalizationDoesNotChangeOtherToolsOrEnumValues() {
        String schema = "{\"type\":\"string\",\"enum\":[\"JSON\",\"KEEP_CASE\"]}";
        assertEquals(schema, ToolSchemaInlineSupport.normalizeInputSchema("unrelatedTool", schema));
    }

    private static final Map<String, String> PARAMETERS = Map.of(
            "insertDataset", "datasetEntity", "updateDataset", "datasetEntity",
            "newPage", "pageEntity", "updatePageConfig", "pageStage");
    private static final Set<String> SERVER_FIELDS = Set.of(
            "id", "tenantCode", "createUser", "createDate", "updateUser", "updateDate");

    @ParameterizedTest
    @ValueSource(strings = {"insertDataset", "updateDataset", "newPage", "updatePageConfig"})
    void realSchemasRequireOnlyBusinessFieldsAndKeepServerProperties(String toolName) throws Exception {
        Map<String, Set<String>> expectedRequired = Map.of(
                "insertDataset", Set.of("name", "datasetType", "parentCode"),
                "updateDataset", Set.of("code", "name", "datasetType", "parentCode"),
                "newPage", Set.of("name"),
                "updatePageConfig", Set.of("pageCode", "pageConfig"));
        JsonNode root = MAPPER.readTree(toolSchema(toolName));
        assertEquals(Set.of(PARAMETERS.get(toolName)), requiredFields(root));
        JsonNode entity = root.path("properties").path(PARAMETERS.get(toolName));
        assertEquals(expectedRequired.get(toolName), requiredFields(entity), toolName);
        for (String field : SERVER_FIELDS) {
            assertTrue(entity.path("properties").has(field), toolName + " 必须保留 " + field);
            assertFalse(requiredFields(entity).contains(field), toolName + " 不应要求 " + field);
            assertFalse(entity.path("properties").path(field).path("description").asText().isBlank());
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"insertDataset", "updateDataset", "newPage", "updatePageConfig"})
    void normalizationOnlyChangesTopLevelRequiredDescriptionsAndDatasetEnum(String toolName) throws Exception {
        ToolCallback original = Arrays.stream(MethodToolCallbackProvider.builder()
                        .toolObjects(new DatasetController(), new PageController()).build().getToolCallbacks())
                .filter(callback -> toolName.equals(callback.getToolDefinition().name()))
                .findFirst().orElseThrow();
        JsonNode expected = MAPPER.readTree(ToolSchemaInlineSupport.inlineRefs(
                original.getToolDefinition().inputSchema()));
        ObjectNode expectedEntity = (ObjectNode) expected.path("properties").path(PARAMETERS.get(toolName));
        SchemaInlineToolCallback wrapped = new SchemaInlineToolCallback(original);
        JsonNode actual = MAPPER.readTree(wrapped.getToolDefinition().inputSchema());
        ObjectNode actualEntity = (ObjectNode) actual.path("properties").path(PARAMETERS.get(toolName));
        if ("datasetEntity".equals(PARAMETERS.get(toolName))) {
            ((ObjectNode) expectedEntity.path("properties").path("datasetType")).set("enum",
                    MAPPER.valueToTree(Arrays.stream(DatasetType.values()).map(DatasetType::getType).toList()));
        }
        // 必填清单和描述另行验证；此处确保类型、属性、内层多态结构等完全未变。
        expectedEntity.remove("required");
        actualEntity.remove("required");
        for (String field : SERVER_FIELDS) {
            ((ObjectNode) expectedEntity.path("properties").path(field)).remove("description");
            ((ObjectNode) actualEntity.path("properties").path(field)).remove("description");
        }
        assertEquals(expected, actual);
        assertEquals(original.getToolDefinition().description(), wrapped.getToolDefinition().description());
        assertEquals(original.getToolMetadata(), wrapped.getToolMetadata());
    }

    @Test
    void toolParamOverridesSchemaAutoRequiredWithoutRelaxingSharedBaseEntity() throws Exception {
        JsonNode dataset = MAPPER.readTree(JsonSchemaGenerator.generateForType(DatasetEntity.class));
        assertFalse(requiredFields(dataset).contains("code"));
        assertFalse(requiredFields(dataset).contains("dataset"));
        assertTrue(dataset.path("properties").path("code").path("description").asText().contains("新增时可省略"));
        for (Class<?> type : List.of(BaseEntity.class, DatasetEntity.class, PageEntity.class, PageStageEntity.class)) {
            JsonNode raw = MAPPER.readTree(JsonSchemaGenerator.generateForType(type));
            assertTrue(requiredFields(raw).containsAll(SERVER_FIELDS), "共享基类必填声明不变：" + type);
            String schema = JsonSchemaGenerator.generateForType(type);
            assertEquals(MAPPER.readTree(ToolSchemaInlineSupport.inlineRefs(schema)),
                    MAPPER.readTree(ToolSchemaInlineSupport.normalizeInputSchema("otherEntityTool", schema)));
        }
    }

    @Test
    void descriptionsMatchDefaultsConditionalInputsAndWriteBehavior() throws Exception {
        JsonNode dataset = MAPPER.readTree(toolSchema("insertDataset")).path("properties")
                .path("datasetEntity").path("properties");
        assertTrue(dataset.path("id").path("description").asText().contains("不会在新增入口清除"));
        assertTrue(dataset.path("code").path("description").asText().contains("覆盖传入值"));
        assertTrue(dataset.path("parentCode").path("description").asText().contains("不会自动补为 root"));
        assertFalse(dataset.path("parentCode").has("default"));
        assertTrue(dataset.path("dataset").findValuesAsText("description").stream()
                .anyMatch(description -> description.contains("目录可省略")), dataset.path("dataset").toString());
        assertTrue(dataset.path("dataSourceCode").path("description").asText().contains("SQL"));
        for (String field : List.of("inputList", "outputList")) {
            assertTrue(dataset.path(field).path("description").asText().contains("可能清空"));
        }
        for (String field : List.of("tenantCode", "createUser", "createDate", "updateUser", "updateDate")) {
            assertTrue(dataset.path(field).path("description").asText().contains("null"));
        }
        JsonNode page = MAPPER.readTree(toolSchema("newPage")).path("properties").path("pageEntity")
                .path("properties");
        assertTrue(page.path("id").path("description").asText().contains("清除传入值"));
        assertTrue(page.path("code").path("description").asText().contains("非空时使用传入值"));
        assertTrue(page.path("parentCode").path("description").asText().contains("默认 root"));
        assertTrue(page.path("pageType").path("description").asText().contains("默认 page"));
        assertTrue(page.path("pageStatus").path("description").asText().contains("固定设为 design"));
        JsonNode stage = MAPPER.readTree(toolSchema("updatePageConfig")).path("properties").path("pageStage")
                .path("properties");
        assertTrue(stage.path("pageType").path("description").asText().contains("不能替代 pageConfig"));
        assertTrue(stage.path("pageConfig").findValuesAsText("description").stream()
                .anyMatch(description -> description.contains("整体替换")), stage.path("pageConfig").toString());
    }

    private Set<String> requiredFields(JsonNode schema) {
        Set<String> required = new HashSet<>();
        schema.path("required").forEach(field -> required.add(field.asText()));
        return required;
    }

    @Test
    void missingDatasetTypeDefinitionFailsExplicitly() {
        assertThrows(IllegalStateException.class,
                () -> ToolSchemaInlineSupport.normalizeInputSchema("insertDataset", "{}"));
    }

    @Test
    void inlineRefsIsIdempotentForPlainSchema() {
        String plain = "{\"type\":\"object\",\"properties\":{\"name\":{\"type\":\"string\"}}}";
        assertEquals(plain, ToolSchemaInlineSupport.inlineRefs(plain));
    }

    @Test
    void inlineRefsKeepsSiblingFields() throws Exception {
        String schema = "{"
                + "\"$defs\":{\"Item\":{\"type\":\"object\",\"properties\":{\"a\":{\"type\":\"string\"}}}},"
                + "\"type\":\"object\","
                + "\"properties\":{\"item\":{\"$ref\":\"#/$defs/Item\",\"description\":\"条目\"}}"
                + "}";
        JsonNode root = MAPPER.readTree(ToolSchemaInlineSupport.inlineRefs(schema));
        JsonNode item = root.path("properties").path("item");
        assertEquals("条目", item.path("description").asText(), "同级 description 应保留");
        assertEquals("string", item.path("properties").path("a").path("type").asText(), "定义字段未内联");
        assertFalse(item.has("$ref"), "引用未被移除");
    }

    private String toolSchema(String toolName) {
        ToolCallback[] callbacks = MethodToolCallbackProvider.builder()
                .toolObjects(new DatasetController(), new PageController())
                .build()
                .getToolCallbacks();
        for (ToolCallback callback : callbacks) {
            if (toolName.equals(callback.getToolDefinition().name())) {
                return new SchemaInlineToolCallback(callback).getToolDefinition().inputSchema();
            }
        }
        return null;
    }
}

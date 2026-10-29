package com.gccloud.gcpaas.core.component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    void updatePageConfigSchemaKeepsPageTypesAfterInline() {
        String schema = toolSchema("updatePageConfig");
        assertNotNull(schema, "updatePageConfig 工具不存在");
        assertTrue(schema.contains("\"visualScreen\""), "内联后缺少 visualScreen 页面类型");
        assertTrue(schema.contains("\"pageCode\""), "内联后缺少 pageCode 字段");
    }

    @Test
    void normalizationDoesNotChangeOtherToolsOrEnumValues() {
        String schema = "{\"type\":\"string\",\"enum\":[\"JSON\",\"KEEP_CASE\"]}";
        assertEquals(schema, ToolSchemaInlineSupport.normalizeInputSchema("unrelatedTool", schema));
    }

    @ParameterizedTest
    @ValueSource(strings = {"insertDataset", "updateDataset"})
    void normalizationOnlyChangesOuterDatasetEnum(String toolName) throws Exception {
        ToolCallback original = Arrays.stream(MethodToolCallbackProvider.builder()
                        .toolObjects(new DatasetController()).build().getToolCallbacks())
                .filter(callback -> toolName.equals(callback.getToolDefinition().name()))
                .findFirst().orElseThrow();
        JsonNode expected = MAPPER.readTree(ToolSchemaInlineSupport.inlineRefs(
                original.getToolDefinition().inputSchema()));
        ((com.fasterxml.jackson.databind.node.ObjectNode) expected.path("properties").path("datasetEntity")
                .path("properties").path("datasetType")).set("enum",
                MAPPER.valueToTree(Arrays.stream(DatasetType.values()).map(DatasetType::getType).toList()));
        SchemaInlineToolCallback wrapped = new SchemaInlineToolCallback(original);
        assertEquals(expected, MAPPER.readTree(wrapped.getToolDefinition().inputSchema()));
        assertEquals(original.getToolDefinition().description(), wrapped.getToolDefinition().description());
        assertEquals(original.getToolMetadata(), wrapped.getToolMetadata());
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

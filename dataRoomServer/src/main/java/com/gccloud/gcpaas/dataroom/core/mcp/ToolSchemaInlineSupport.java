package com.gccloud.gcpaas.dataroom.core.mcp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.gccloud.gcpaas.dataroom.core.constant.DatasetType;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * MCP 工具 inputSchema 的 $ref 内联支持。
 *
 * <p>Spring AI 基于 victools 生成的工具 schema 中，多态类型（如 BaseDataset/BasePageConfig）
 * 会产生 $defs + $ref（且 $defs 位于参数节点内、$ref 却指向根部，属于悬空引用），
 * 部分 MCP 客户端（AgentScope 等）不做引用解析，直接报错。这里在注册前把引用展开为内联定义。
 */
@Slf4j
public final class ToolSchemaInlineSupport {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final String DEFS = "$defs";
    private static final String REF = "$ref";
    private static final String REF_PREFIX = "#/$defs/";

    private ToolSchemaInlineSupport() {
    }

    /**
     * 规范化对外 MCP 契约，不改变回调入参转换、REST 或数据库枚举值。
     * Spring AI 当前生成的 DatasetType 枚举使用 name()，需要对齐既有 @JsonValue 值。
     */
    public static String normalizeInputSchema(String toolName, String inputSchema) {
        String schema = inlineRefs(inputSchema);
        if (!"insertDataset".equals(toolName) && !"updateDataset".equals(toolName)) {
            return schema;
        }
        try {
            JsonNode root = MAPPER.readTree(schema);
            JsonNode typeSchema = root.path("properties").path("datasetEntity")
                    .path("properties").path("datasetType");
            if (!(typeSchema instanceof ObjectNode typeObject)) {
                throw new IllegalStateException("数据集 MCP 工具缺少 datasetEntity.datasetType 定义：" + toolName);
            }
            // 只替换外层类型枚举，不全局转小写，不改内层多态 const 或其他工具。
            var values = typeObject.putArray("enum");
            for (DatasetType type : DatasetType.values()) {
                values.add(type.getType());
            }
            return MAPPER.writeValueAsString(root);
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new IllegalStateException("数据集 MCP 参数定义规范化失败：" + toolName, e);
        }
    }

    /**
     * 展开 schema 中的 $defs/$ref 引用。解析失败时记录日志并返回原 schema。
     *
     * @param inputSchema 原始 schema JSON 文本
     * @return 内联后的 schema JSON 文本
     */
    public static String inlineRefs(String inputSchema) {
        if (inputSchema == null || (!inputSchema.contains(REF) && !inputSchema.contains(DEFS))) {
            return inputSchema;
        }
        try {
            JsonNode root = MAPPER.readTree(inputSchema);
            Map<String, ObjectNode> defs = new HashMap<>();
            collectDefs(root, defs);
            if (defs.isEmpty()) {
                return inputSchema;
            }
            inlineNode(root, defs, new ArrayDeque<>());
            return MAPPER.writeValueAsString(root);
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            return inputSchema;
        }
    }

    /**
     * 收集整棵树上所有 $defs 定义并移除节点。同名定义保留先出现的一份。
     */
    private static void collectDefs(JsonNode node, Map<String, ObjectNode> defs) {
        if (node == null) {
            return;
        }
        if (node.isObject()) {
            ObjectNode objectNode = (ObjectNode) node;
            JsonNode defsNode = objectNode.get(DEFS);
            if (defsNode instanceof ObjectNode defsObject) {
                Iterator<Map.Entry<String, JsonNode>> fields = defsObject.fields();
                while (fields.hasNext()) {
                    Map.Entry<String, JsonNode> entry = fields.next();
                    if (entry.getValue() instanceof ObjectNode defObject) {
                        defs.putIfAbsent(entry.getKey(), defObject);
                    }
                }
                objectNode.remove(DEFS);
            }
            objectNode.forEach(child -> collectDefs(child, defs));
        } else if (node.isArray()) {
            node.forEach(child -> collectDefs(child, defs));
        }
    }

    /**
     * 递归替换 $ref 节点为对应定义的内联拷贝；同级其他字段（如 description）保留。
     */
    private static void inlineNode(JsonNode node, Map<String, ObjectNode> defs, Deque<String> refStack) {
        if (node == null) {
            return;
        }
        if (node.isObject()) {
            ObjectNode objectNode = (ObjectNode) node;
            JsonNode refNode = objectNode.get(REF);
            if (refNode != null && refNode.isTextual() && refNode.asText().startsWith(REF_PREFIX)) {
                String defName = refNode.asText().substring(REF_PREFIX.length());
                ObjectNode def = defs.get(defName);
                if (def == null) {
                    log.warn("MCP工具schema存在无法解析的引用：{}", refNode.asText());
                } else if (refStack.contains(defName)) {
                    // 循环引用兜底：展开为空对象，避免无限递归
                    log.warn("MCP工具schema存在循环引用：{}", refNode.asText());
                    objectNode.remove(REF);
                    objectNode.put("type", "object");
                } else {
                    refStack.addLast(defName);
                    ObjectNode defCopy = def.deepCopy();
                    inlineNode(defCopy, defs, refStack);
                    refStack.removeLast();
                    objectNode.remove(REF);
                    // 定义字段先填入，$ref 同级的显式字段（如 description）优先覆盖
                    defCopy.fields().forEachRemaining(entry -> {
                        if (!objectNode.has(entry.getKey())) {
                            objectNode.set(entry.getKey(), entry.getValue());
                        }
                    });
                }
            }
            objectNode.forEach(child -> inlineNode(child, defs, refStack));
        } else if (node.isArray()) {
            node.forEach(child -> inlineNode(child, defs, refStack));
        }
    }
}

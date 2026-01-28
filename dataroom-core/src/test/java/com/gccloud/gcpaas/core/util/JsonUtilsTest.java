package com.gccloud.gcpaas.core.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * JsonUtils 单元测试
 */
@DisplayName("JsonUtils 工具类测试")
class JsonUtilsTest {

    @Test
    @DisplayName("测试获取单例实例")
    void testGetInstance() {
        // 获取实例
        ObjectMapper instance1 = JsonUtils.getInstance();
        ObjectMapper instance2 = JsonUtils.getInstance();
        
        // 验证不为空
        assertNotNull(instance1, "实例不应为空");
        assertNotNull(instance2, "实例不应为空");
        
        // 验证是同一个实例（单例模式）
        assertSame(instance1, instance2, "应返回同一个单例实例");
    }

    @Test
    @DisplayName("测试单例实例是否为JsonUtils类型")
    void testInstanceType() {
        ObjectMapper instance = JsonUtils.getInstance();
        
        // 验证实例类型
        assertTrue(instance instanceof JsonUtils, "实例应为JsonUtils类型");
        assertTrue(instance instanceof ObjectMapper, "实例应为ObjectMapper类型");
    }

    @Test
    @DisplayName("测试静态字段objectMapper")
    void testStaticObjectMapper() {
        // 验证静态字段不为空
        assertNotNull(JsonUtils.objectMapper, "静态objectMapper字段不应为空");
        
        // 验证静态字段与getInstance()返回同一实例
        assertSame(JsonUtils.objectMapper, JsonUtils.getInstance(), "静态字段应与getInstance()返回同一实例");
    }

    @Test
    @DisplayName("测试JSON序列化功能")
    void testJsonSerialization() throws JsonProcessingException {
        ObjectMapper mapper = JsonUtils.getInstance();
        
        // 创建测试对象
        Map<String, Object> testMap = new HashMap<>();
        testMap.put("name", "测试");
        testMap.put("age", 25);
        testMap.put("active", true);
        
        // 序列化为JSON字符串
        String json = mapper.writeValueAsString(testMap);
        
        // 验证结果
        assertNotNull(json, "序列化结果不应为空");
        assertTrue(json.contains("name"), "JSON应包含name字段");
        assertTrue(json.contains("age"), "JSON应包含age字段");
        assertTrue(json.contains("active"), "JSON应包含active字段");
    }

    @Test
    @DisplayName("测试JSON反序列化功能")
    void testJsonDeserialization() throws JsonProcessingException {
        ObjectMapper mapper = JsonUtils.getInstance();
        
        // JSON字符串
        String json = "{\"name\":\"测试\",\"age\":25,\"active\":true}";
        
        // 反序列化为Map
        @SuppressWarnings("unchecked")
        Map<String, Object> result = mapper.readValue(json, Map.class);
        
        // 验证结果
        assertNotNull(result, "反序列化结果不应为空");
        assertEquals("测试", result.get("name"), "name字段应正确");
        assertEquals(25, result.get("age"), "age字段应正确");
        assertEquals(true, result.get("active"), "active字段应正确");
    }

    @Test
    @DisplayName("测试JSON树模型操作")
    void testJsonTreeModel() throws JsonProcessingException {
        ObjectMapper mapper = JsonUtils.getInstance();
        
        // JSON字符串
        String json = "{\"user\":{\"name\":\"测试\",\"age\":25}}";
        
        // 解析为树节点
        JsonNode rootNode = mapper.readTree(json);
        
        // 验证树结构
        assertNotNull(rootNode, "根节点不应为空");
        assertTrue(rootNode.has("user"), "应包含user节点");
        
        JsonNode userNode = rootNode.get("user");
        assertEquals("测试", userNode.get("name").asText(), "用户名应正确");
        assertEquals(25, userNode.get("age").asInt(), "年龄应正确");
    }

    @Test
    @DisplayName("测试对象转换功能")
    void testObjectConversion() throws JsonProcessingException {
        ObjectMapper mapper = JsonUtils.getInstance();
        
        // 创建源对象
        Map<String, Object> source = new HashMap<>();
        source.put("name", "测试");
        source.put("age", 25);
        
        // 先序列化再反序列化
        String json = mapper.writeValueAsString(source);
        @SuppressWarnings("unchecked")
        Map<String, Object> target = mapper.readValue(json, Map.class);
        
        // 验证转换正确
        assertEquals(source.get("name"), target.get("name"), "name字段应一致");
        assertEquals(source.get("age"), target.get("age"), "age字段应一致");
    }

    @Test
    @DisplayName("测试多次调用getInstance返回相同实例")
    void testMultipleGetInstanceCalls() {
        ObjectMapper instance1 = JsonUtils.getInstance();
        ObjectMapper instance2 = JsonUtils.getInstance();
        ObjectMapper instance3 = JsonUtils.getInstance();
        
        // 验证所有调用返回相同实例
        assertSame(instance1, instance2, "第一次和第二次调用应返回相同实例");
        assertSame(instance2, instance3, "第二次和第三次调用应返回相同实例");
        assertSame(instance1, instance3, "第一次和第三次调用应返回相同实例");
    }

    @Test
    @DisplayName("测试处理null值")
    void testHandleNullValue() throws JsonProcessingException {
        ObjectMapper mapper = JsonUtils.getInstance();
        
        // 创建包含null值的Map
        Map<String, Object> testMap = new HashMap<>();
        testMap.put("name", "测试");
        testMap.put("value", null);
        
        // 序列化
        String json = mapper.writeValueAsString(testMap);
        
        // 验证null值被正确处理
        assertNotNull(json, "序列化结果不应为空");
        assertTrue(json.contains("name"), "JSON应包含name字段");
    }

    @Test
    @DisplayName("测试处理空对象")
    void testHandleEmptyObject() throws JsonProcessingException {
        ObjectMapper mapper = JsonUtils.getInstance();
        
        // 空Map
        Map<String, Object> emptyMap = new HashMap<>();
        
        // 序列化
        String json = mapper.writeValueAsString(emptyMap);
        
        // 验证结果
        assertNotNull(json, "序列化结果不应为空");
        assertEquals("{}", json, "空对象应序列化为{}");
    }
}

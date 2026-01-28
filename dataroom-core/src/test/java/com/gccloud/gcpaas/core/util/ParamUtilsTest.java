package com.gccloud.gcpaas.core.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ParamUtils 单元测试
 */
@DisplayName("ParamUtils 工具类测试")
class ParamUtilsTest {

    @Test
    @DisplayName("测试解析单个参数")
    void testParseSingleParam() {
        String content = "SELECT * FROM user WHERE id = #{id}";
        Set<String> params = ParamUtils.parse(content);
        
        // 验证结果
        assertNotNull(params, "解析结果不应为空");
        assertEquals(1, params.size(), "应解析出1个参数");
        assertTrue(params.contains("id"), "应包含参数id");
    }

    @Test
    @DisplayName("测试解析多个参数")
    void testParseMultipleParams() {
        String content = "SELECT * FROM user WHERE name = #{name} AND age = #{age} AND status = #{status}";
        Set<String> params = ParamUtils.parse(content);
        
        // 验证结果
        assertNotNull(params, "解析结果不应为空");
        assertEquals(3, params.size(), "应解析出3个参数");
        assertTrue(params.contains("name"), "应包含参数name");
        assertTrue(params.contains("age"), "应包含参数age");
        assertTrue(params.contains("status"), "应包含参数status");
    }

    @Test
    @DisplayName("测试解析重复参数")
    void testParseDuplicateParams() {
        String content = "SELECT * FROM user WHERE id = #{id} OR parent_id = #{id}";
        Set<String> params = ParamUtils.parse(content);
        
        // 验证结果（Set会自动去重）
        assertNotNull(params, "解析结果不应为空");
        assertEquals(1, params.size(), "重复参数应去重，只有1个");
        assertTrue(params.contains("id"), "应包含参数id");
    }

    @Test
    @DisplayName("测试解析带空格的参数")
    void testParseParamWithSpaces() {
        String content = "SELECT * FROM user WHERE id = #{ id } AND name = #{  name  }";
        Set<String> params = ParamUtils.parse(content);
        
        // 验证结果（trim会去除空格）
        assertNotNull(params, "解析结果不应为空");
        assertEquals(2, params.size(), "应解析出2个参数");
        assertTrue(params.contains("id"), "应包含参数id（去除空格）");
        assertTrue(params.contains("name"), "应包含参数name（去除空格）");
    }

    @Test
    @DisplayName("测试解析不包含参数的内容")
    void testParseNoParams() {
        String content = "SELECT * FROM user WHERE id = 1";
        Set<String> params = ParamUtils.parse(content);
        
        // 验证结果
        assertNotNull(params, "解析结果不应为空");
        assertTrue(params.isEmpty(), "不包含参数时应返回空集合");
    }

    @Test
    @DisplayName("测试解析空字符串")
    void testParseEmptyString() {
        String content = "";
        Set<String> params = ParamUtils.parse(content);
        
        // 验证结果
        assertNotNull(params, "解析结果不应为空");
        assertTrue(params.isEmpty(), "空字符串应返回空集合");
    }

    @Test
    @DisplayName("测试解析包含特殊字符的参数名")
    void testParseParamWithSpecialChars() {
        String content = "SELECT * FROM user WHERE id = #{user_id} AND code = #{user.code}";
        Set<String> params = ParamUtils.parse(content);
        
        // 验证结果
        assertNotNull(params, "解析结果不应为空");
        assertEquals(2, params.size(), "应解析出2个参数");
        assertTrue(params.contains("user_id"), "应包含参数user_id");
        assertTrue(params.contains("user.code"), "应包含参数user.code");
    }

    @Test
    @DisplayName("测试替换单个参数")
    void testReplaceSingleParam() {
        String content = "SELECT * FROM user WHERE id = #{id}";
        String result = ParamUtils.replace(content, "id", "123");
        
        // 验证结果
        assertNotNull(result, "替换结果不应为空");
        assertEquals("SELECT * FROM user WHERE id = 123", result, "参数应被正确替换");
        assertFalse(result.contains("#{"), "不应包含参数标记");
    }

    @Test
    @DisplayName("测试替换多次相同参数")
    void testReplaceMultipleSameParam() {
        String content = "SELECT * FROM user WHERE id = #{id} OR parent_id = #{id}";
        String result = ParamUtils.replace(content, "id", "123");
        
        // 验证结果
        assertNotNull(result, "替换结果不应为空");
        assertEquals("SELECT * FROM user WHERE id = 123 OR parent_id = 123", result, "所有相同参数应被替换");
        assertFalse(result.contains("#{"), "不应包含参数标记");
    }

    @Test
    @DisplayName("测试替换带空格的参数")
    void testReplaceParamWithSpaces() {
        String content = "SELECT * FROM user WHERE id = #{ id } AND name = #{  id  }";
        String result = ParamUtils.replace(content, "id", "123");
        
        // 验证结果
        assertNotNull(result, "替换结果不应为空");
        assertEquals("SELECT * FROM user WHERE id = 123 AND name = 123", result, "带空格的参数应被正确替换");
        assertFalse(result.contains("#{"), "不应包含参数标记");
    }

    @Test
    @DisplayName("测试替换不存在的参数")
    void testReplaceNonExistentParam() {
        String content = "SELECT * FROM user WHERE id = #{id}";
        String result = ParamUtils.replace(content, "name", "test");
        
        // 验证结果（内容不变）
        assertNotNull(result, "替换结果不应为空");
        assertEquals(content, result, "不存在的参数不应改变原内容");
        assertTrue(result.contains("#{id}"), "原参数应保留");
    }

    @Test
    @DisplayName("测试替换参数为空字符串")
    void testReplaceParamWithEmptyValue() {
        String content = "SELECT * FROM user WHERE name = #{name}";
        String result = ParamUtils.replace(content, "name", "");
        
        // 验证结果
        assertNotNull(result, "替换结果不应为空");
        assertEquals("SELECT * FROM user WHERE name = ", result, "参数应被替换为空字符串");
    }

    @Test
    @DisplayName("测试替换包含特殊正则字符的参数名")
    void testReplaceParamWithRegexChars() {
        String content = "SELECT * FROM user WHERE code = #{user.code}";
        String result = ParamUtils.replace(content, "user.code", "'ABC123'");
        
        // 验证结果
        assertNotNull(result, "替换结果不应为空");
        assertEquals("SELECT * FROM user WHERE code = 'ABC123'", result, "包含.的参数名应被正确替换");
    }

    @Test
    @DisplayName("测试组合使用parse和replace")
    void testCombineParseAndReplace() {
        String content = "SELECT * FROM user WHERE name = #{name} AND age = #{age}";
        
        // 先解析参数
        Set<String> params = ParamUtils.parse(content);
        assertEquals(2, params.size(), "应解析出2个参数");
        
        // 依次替换参数
        String result = content;
        result = ParamUtils.replace(result, "name", "'张三'");
        result = ParamUtils.replace(result, "age", "25");
        
        // 验证结果
        assertEquals("SELECT * FROM user WHERE name = '张三' AND age = 25", result, "所有参数应被正确替换");
        assertFalse(result.contains("#{"), "不应包含参数标记");
    }

    @Test
    @DisplayName("测试解析复杂SQL语句")
    void testParseComplexSql() {
        String content = "SELECT u.*, o.order_no FROM user u " +
                "LEFT JOIN orders o ON u.id = o.user_id " +
                "WHERE u.name LIKE #{name} AND u.age > #{minAge} " +
                "AND o.status IN (#{status1}, #{status2}) " +
                "ORDER BY #{orderBy}";
        
        Set<String> params = ParamUtils.parse(content);
        
        // 验证结果
        assertNotNull(params, "解析结果不应为空");
        assertEquals(5, params.size(), "应解析出5个参数");
        assertTrue(params.contains("name"), "应包含参数name");
        assertTrue(params.contains("minAge"), "应包含参数minAge");
        assertTrue(params.contains("status1"), "应包含参数status1");
        assertTrue(params.contains("status2"), "应包含参数status2");
        assertTrue(params.contains("orderBy"), "应包含参数orderBy");
    }

    @Test
    @DisplayName("测试替换包含SQL注入风险的值")
    void testReplaceSqlInjectionValue() {
        String content = "SELECT * FROM user WHERE name = #{name}";
        String dangerousValue = "' OR '1'='1";
        String result = ParamUtils.replace(content, "name", dangerousValue);
        
        // 验证结果（注意：实际使用时应该用参数化查询，这里只是测试替换功能）
        assertNotNull(result, "替换结果不应为空");
        assertTrue(result.contains(dangerousValue), "应能替换任意值（但实际使用需注意安全）");
    }
}

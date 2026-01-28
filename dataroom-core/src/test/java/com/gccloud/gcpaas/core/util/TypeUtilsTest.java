package com.gccloud.gcpaas.core.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

/**
 * TypeUtils 单元测试
 */
@DisplayName("TypeUtils 工具类测试")
class TypeUtilsTest {

    // ==================== transType 方法测试 ====================

    @Test
    @DisplayName("测试转换为int类型")
    void testTransTypeToInt() {
        // 测试字符串转int
        Object result = TypeUtils.transType("123", "int");
        assertTrue(result instanceof Integer, "结果应为Integer类型");
        assertEquals(123, result, "转换值应正确");
        
        // 测试不同大小写
        result = TypeUtils.transType("456", "INT");
        assertEquals(456, result, "不区分大小写");
        
        result = TypeUtils.transType("789", "Int");
        assertEquals(789, result, "不区分大小写");
    }

    @Test
    @DisplayName("测试转换为String类型")
    void testTransTypeToString() {
        // 测试数字转字符串
        Object result = TypeUtils.transType(123, "String");
        assertTrue(result instanceof String, "结果应为String类型");
        assertEquals("123", result, "转换值应正确");
        
        // 测试不同大小写
        result = TypeUtils.transType(456, "STRING");
        assertEquals("456", result, "不区分大小写");
        
        result = TypeUtils.transType(789, "string");
        assertEquals("789", result, "不区分大小写");
    }

    @Test
    @DisplayName("测试转换未知类型返回原值")
    void testTransTypeUnknownTypeReturnsOriginal() {
        Object value = "test";
        Object result = TypeUtils.transType(value, "unknown");
        
        // 未知类型应返回原值
        assertSame(value, result, "未知类型应返回原值");
    }

    @Test
    @DisplayName("测试转换浮点数字符串为int")
    void testTransTypeFloatStringToInt() {
        // 浮点数字符串转int会抛出异常
        assertThrows(NumberFormatException.class, () -> {
            TypeUtils.transType("123.45", "int");
        }, "浮点数字符串转int应抛出异常");
    }

    @Test
    @DisplayName("测试转换负数为int")
    void testTransTypeNegativeToInt() {
        Object result = TypeUtils.transType("-123", "int");
        assertEquals(-123, result, "应能转换负数");
    }

    @Test
    @DisplayName("测试转换对象为String")
    void testTransTypeObjectToString() {
        Date date = new Date();
        Object result = TypeUtils.transType(date, "String");
        
        assertTrue(result instanceof String, "结果应为String类型");
        assertEquals(date.toString(), result, "应调用对象的toString方法");
    }

    // ==================== parseType 方法测试 ====================

    @Test
    @DisplayName("测试识别Short类型")
    void testParseTypeShort() {
        Short shortVal = 100;
        String type = TypeUtils.parseType(shortVal);
        assertEquals("int", type, "Short应识别为int类型");
    }

    @Test
    @DisplayName("测试识别Integer类型")
    void testParseTypeInteger() {
        Integer intVal = 12345;
        String type = TypeUtils.parseType(intVal);
        assertEquals("int", type, "Integer应识别为int类型");
    }

    @Test
    @DisplayName("测试识别Long类型")
    void testParseTypeLong() {
        Long longVal = 123456789L;
        String type = TypeUtils.parseType(longVal);
        assertEquals("int", type, "Long应识别为int类型");
    }

    @Test
    @DisplayName("测试识别Float类型")
    void testParseTypeFloat() {
        Float floatVal = 123.45f;
        String type = TypeUtils.parseType(floatVal);
        assertEquals("int", type, "Float应识别为int类型");
    }

    @Test
    @DisplayName("测试识别Double类型")
    void testParseTypeDouble() {
        Double doubleVal = 123.456;
        String type = TypeUtils.parseType(doubleVal);
        assertEquals("int", type, "Double应识别为int类型");
    }

    @Test
    @DisplayName("测试识别Date对象")
    void testParseTypeDateObject() {
        Date date = new Date();
        String type = TypeUtils.parseType(date);
        assertEquals("Date", type, "Date对象应识别为Date类型");
    }

    @Test
    @DisplayName("测试识别yyyy-MM格式日期字符串")
    void testParseTypeDateStringYearMonth() {
        String dateStr = "2024-01";
        String type = TypeUtils.parseType(dateStr);
        assertEquals("Date", type, "yyyy-MM格式应识别为Date类型");
    }

    @Test
    @DisplayName("测试识别yyyy-MM-dd格式日期字符串")
    void testParseTypeDateStringYearMonthDay() {
        String dateStr = "2024-01-28";
        String type = TypeUtils.parseType(dateStr);
        assertEquals("Date", type, "yyyy-MM-dd格式应识别为Date类型");
    }

    @Test
    @DisplayName("测试识别yyyy-MM-dd HH:ss:mm格式日期字符串")
    void testParseTypeDateStringFull() {
        String dateStr = "2024-01-28 10:30:45";
        String type = TypeUtils.parseType(dateStr);
        assertEquals("Date", type, "yyyy-MM-dd HH:ss:mm格式应识别为Date类型");
    }

    @Test
    @DisplayName("测试识别HH:ss:mm格式时间字符串")
    void testParseTypeTimeString() {
        String timeStr = "14:30:00";
        String type = TypeUtils.parseType(timeStr);
        assertEquals("Date", type, "HH:ss:mm格式应识别为Date类型");
    }

    @Test
    @DisplayName("测试识别普通字符串")
    void testParseTypeString() {
        String str = "hello world";
        String type = TypeUtils.parseType(str);
        assertEquals("String", type, "普通字符串应识别为String类型");
    }

    @Test
    @DisplayName("测试识别数字字符串")
    void testParseTypeNumericString() {
        String numStr = "12345";
        String type = TypeUtils.parseType(numStr);
        assertEquals("String", type, "纯数字字符串应识别为String类型");
    }

    @Test
    @DisplayName("测试识别空字符串")
    void testParseTypeEmptyString() {
        String emptyStr = "";
        String type = TypeUtils.parseType(emptyStr);
        assertEquals("String", type, "空字符串应识别为String类型");
    }

    @Test
    @DisplayName("测试识别无效日期字符串")
    void testParseTypeInvalidDateString() {
        String invalidDate = "2024-13-45"; // 无效的月份和日期
        String type = TypeUtils.parseType(invalidDate);
        assertEquals("String", type, "无效日期字符串应识别为String类型");
    }

    @Test
    @DisplayName("测试识别特殊字符串")
    void testParseTypeSpecialString() {
        String specialStr = "!@#$%^&*()";
        String type = TypeUtils.parseType(specialStr);
        assertEquals("String", type, "特殊字符串应识别为String类型");
    }

    @Test
    @DisplayName("测试识别布尔值")
    void testParseTypeBoolean() {
        Boolean boolVal = true;
        String type = TypeUtils.parseType(boolVal);
        assertEquals("String", type, "布尔值应识别为String类型");
    }

    @Test
    @DisplayName("测试识别零值")
    void testParseTypeZero() {
        Integer zero = 0;
        String type = TypeUtils.parseType(zero);
        assertEquals("int", type, "零值应识别为int类型");
    }

    @Test
    @DisplayName("测试识别负数")
    void testParseTypeNegativeNumber() {
        Integer negNum = -100;
        String type = TypeUtils.parseType(negNum);
        assertEquals("int", type, "负数应识别为int类型");
    }

    @Test
    @DisplayName("测试识别不同日期格式优先级")
    void testParseTypeDateFormatPriority() {
        // yyyy-MM格式
        assertEquals("Date", TypeUtils.parseType("2024-01"), "应识别yyyy-MM");
        
        // yyyy-MM-dd格式
        assertEquals("Date", TypeUtils.parseType("2024-01-28"), "应识别yyyy-MM-dd");
        
        // yyyy-MM-dd HH:ss:mm格式
        assertEquals("Date", TypeUtils.parseType("2024-01-28 10:30:45"), "应识别yyyy-MM-dd HH:ss:mm");
        
        // HH:ss:mm格式
        assertEquals("Date", TypeUtils.parseType("10:30:45"), "应识别HH:ss:mm");
    }

    // ==================== 组合测试 ====================

    @Test
    @DisplayName("测试类型识别和转换的完整流程")
    void testCompleteTypeParseAndTransFlow() {
        // 1. 识别整数类型
        Object intValue = 123;
        String intType = TypeUtils.parseType(intValue);
        assertEquals("int", intType, "应识别为int类型");
        
        // 2. 转换为String
        Object strValue = TypeUtils.transType(intValue, "String");
        assertEquals("123", strValue, "应转换为字符串");
        
        // 3. 识别字符串类型
        String strType = TypeUtils.parseType(strValue);
        assertEquals("String", strType, "应识别为String类型");
        
        // 4. 转换回int
        Object backToInt = TypeUtils.transType(strValue, "int");
        assertEquals(123, backToInt, "应转换回整数");
    }

    @Test
    @DisplayName("测试日期类型识别和转换")
    void testDateTypeParseAndTrans() {
        // 识别日期对象
        Date date = new Date();
        String type = TypeUtils.parseType(date);
        assertEquals("Date", type, "应识别为Date类型");
        
        // 转换为String
        Object strValue = TypeUtils.transType(date, "String");
        assertTrue(strValue instanceof String, "应能转换为字符串");
    }

    @Test
    @DisplayName("测试数值类型全覆盖")
    void testAllNumericTypes() {
        // 测试所有数值类型都能被识别为int
        assertEquals("int", TypeUtils.parseType((short) 1), "Short应识别为int");
        assertEquals("int", TypeUtils.parseType(1), "Integer应识别为int");
        assertEquals("int", TypeUtils.parseType(1L), "Long应识别为int");
        assertEquals("int", TypeUtils.parseType(1.0f), "Float应识别为int");
        assertEquals("int", TypeUtils.parseType(1.0), "Double应识别为int");
    }

    @Test
    @DisplayName("测试边界日期值")
    void testBoundaryDateValues() {
        // 测试边界月份
        assertEquals("Date", TypeUtils.parseType("2024-01"), "最小月份");
        assertEquals("Date", TypeUtils.parseType("2024-12"), "最大月份");
        
        // 测试边界日期
        assertEquals("Date", TypeUtils.parseType("2024-01-01"), "月初");
        assertEquals("Date", TypeUtils.parseType("2024-12-31"), "年末");
        
        // 测试边界时间
        assertEquals("Date", TypeUtils.parseType("00:00:00"), "零点");
        assertEquals("Date", TypeUtils.parseType("23:59:59"), "23点59分");
    }
}

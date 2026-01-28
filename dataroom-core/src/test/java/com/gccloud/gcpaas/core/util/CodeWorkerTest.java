package com.gccloud.gcpaas.core.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * CodeWorker 单元测试
 */
@DisplayName("CodeWorker 工具类测试")
class CodeWorkerTest {

    @Test
    @DisplayName("测试生成不带前缀的编码")
    void testGenerateCodeWithoutPrefix() {
        // 生成编码（无前缀）
        String code = CodeWorker.generateCode(null);
        
        // 验证编码不为空
        assertNotNull(code, "生成的编码不应为空");
        
        // 验证编码长度为32（UUID去掉横线后的长度）
        assertEquals(32, code.length(), "编码长度应为32");
        
        // 验证编码是大写字母和数字组成
        assertTrue(code.matches("[A-Z0-9]+"), "编码应只包含大写字母和数字");
    }

    @Test
    @DisplayName("测试生成带前缀的编码")
    void testGenerateCodeWithPrefix() {
        String prefix = "TEST";
        
        // 生成编码（带前缀）
        String code = CodeWorker.generateCode(prefix);
        
        // 验证编码不为空
        assertNotNull(code, "生成的编码不应为空");
        
        // 验证编码以指定前缀开头
        assertTrue(code.startsWith(prefix + "_"), "编码应以 'TEST_' 开头");
        
        // 验证编码总长度 = 前缀长度 + 1(下划线) + 32(UUID)
        assertEquals(prefix.length() + 1 + 32, code.length(), "编码长度应为: 前缀 + '_' + 32位UUID");
        
        // 提取UUID部分并验证格式
        String uuidPart = code.substring(prefix.length() + 1);
        assertTrue(uuidPart.matches("[A-Z0-9]+"), "UUID部分应只包含大写字母和数字");
    }

    @Test
    @DisplayName("测试生成空字符串前缀的编码")
    void testGenerateCodeWithEmptyPrefix() {
        // 生成编码（空字符串前缀）
        String code = CodeWorker.generateCode("");
        
        // 验证编码不为空
        assertNotNull(code, "生成的编码不应为空");
        
        // 验证编码长度为32（空前缀应当作无前缀处理）
        assertEquals(32, code.length(), "空前缀应当作无前缀处理，编码长度应为32");
        
        // 验证不包含下划线
        assertFalse(code.contains("_"), "空前缀生成的编码不应包含下划线");
    }

    @Test
    @DisplayName("测试生成空白字符串前缀的编码")
    void testGenerateCodeWithBlankPrefix() {
        // 生成编码（空白字符串前缀）
        String code = CodeWorker.generateCode("   ");
        
        // 验证编码不为空
        assertNotNull(code, "生成的编码不应为空");
        
        // 验证编码长度为32（空白前缀应当作无前缀处理）
        assertEquals(32, code.length(), "空白前缀应当作无前缀处理，编码长度应为32");
    }

    @Test
    @DisplayName("测试多次生成编码的唯一性")
    void testGenerateCodeUniqueness() {
        Set<String> codes = new HashSet<>();
        int count = 1000;
        
        // 生成1000个编码
        for (int i = 0; i < count; i++) {
            String code = CodeWorker.generateCode("PREFIX");
            codes.add(code);
        }
        
        // 验证所有编码都是唯一的
        assertEquals(count, codes.size(), "生成的所有编码应该是唯一的");
    }

    @Test
    @DisplayName("测试不同前缀生成的编码")
    void testGenerateCodeWithDifferentPrefixes() {
        String[] prefixes = {"USER", "ORDER", "PRODUCT", "DATA", "PAGE"};
        
        for (String prefix : prefixes) {
            String code = CodeWorker.generateCode(prefix);
            
            // 验证每个前缀都正确应用
            assertTrue(code.startsWith(prefix + "_"), 
                String.format("编码应以 '%s_' 开头", prefix));
            
            // 验证编码格式
            assertEquals(prefix.length() + 1 + 32, code.length(), 
                String.format("前缀 '%s' 生成的编码长度不正确", prefix));
        }
    }

    @Test
    @DisplayName("测试生成编码的格式一致性")
    void testGenerateCodeFormatConsistency() {
        String prefix = "TEST";
        
        // 多次生成并验证格式
        for (int i = 0; i < 100; i++) {
            String code = CodeWorker.generateCode(prefix);
            
            // 验证格式：前缀_32位大写字母数字
            assertTrue(code.matches("TEST_[A-Z0-9]{32}"), 
                "编码格式应为: TEST_[A-Z0-9]{32}");
        }
    }

    @Test
    @DisplayName("测试带特殊字符前缀的编码生成")
    void testGenerateCodeWithSpecialCharacterPrefix() {
        String prefix = "TEST-PREFIX";
        
        // 生成编码
        String code = CodeWorker.generateCode(prefix);
        
        // 验证编码正确生成
        assertNotNull(code, "即使前缀包含特殊字符，编码也应正常生成");
        assertTrue(code.startsWith(prefix + "_"), "编码应包含特殊字符前缀");
    }

    @Test
    @DisplayName("测试长前缀的编码生成")
    void testGenerateCodeWithLongPrefix() {
        String longPrefix = "THIS_IS_A_VERY_LONG_PREFIX_FOR_TESTING_PURPOSE";
        
        // 生成编码
        String code = CodeWorker.generateCode(longPrefix);
        
        // 验证编码正确生成
        assertNotNull(code, "长前缀应能正常生成编码");
        assertTrue(code.startsWith(longPrefix + "_"), "编码应以长前缀开头");
        assertEquals(longPrefix.length() + 1 + 32, code.length(), "编码长度应正确");
    }
}

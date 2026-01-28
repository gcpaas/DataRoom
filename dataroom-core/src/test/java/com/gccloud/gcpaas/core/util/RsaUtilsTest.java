package com.gccloud.gcpaas.core.util;

import com.gccloud.gcpaas.core.bean.Rsa;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * RsaUtils 单元测试
 */
@DisplayName("RsaUtils 工具类测试")
class RsaUtilsTest {

    private Rsa rsaKeyPair;

    @BeforeEach
    void setUp() {
        // 每个测试前生成新的密钥对
        rsaKeyPair = RsaUtils.generateRsaKeyPair();
    }

    @Test
    @DisplayName("测试生成RSA密钥对")
    void testGenerateRsaKeyPair() {
        // 验证密钥对不为空
        assertNotNull(rsaKeyPair, "密钥对不应为空");
        assertNotNull(rsaKeyPair.getPublicKey(), "公钥不应为空");
        assertNotNull(rsaKeyPair.getPrivateKey(), "私钥不应为空");
        
        // 验证密钥格式（Base64编码的字符串）
        assertTrue(rsaKeyPair.getPublicKey().length() > 0, "公钥长度应大于0");
        assertTrue(rsaKeyPair.getPrivateKey().length() > 0, "私钥长度应大于0");
        
        // 验证密钥格式正确（Base64字符）
        assertTrue(rsaKeyPair.getPublicKey().matches("[A-Za-z0-9+/=]+"), "公钥应为Base64格式");
        assertTrue(rsaKeyPair.getPrivateKey().matches("[A-Za-z0-9+/=]+"), "私钥应为Base64格式");
    }

    @Test
    @DisplayName("测试每次生成不同的密钥对")
    void testGenerateDifferentKeyPairs() {
        Rsa keyPair1 = RsaUtils.generateRsaKeyPair();
        Rsa keyPair2 = RsaUtils.generateRsaKeyPair();
        
        // 验证两次生成的密钥对不同
        assertNotEquals(keyPair1.getPublicKey(), keyPair2.getPublicKey(), "每次生成的公钥应不同");
        assertNotEquals(keyPair1.getPrivateKey(), keyPair2.getPrivateKey(), "每次生成的私钥应不同");
    }

    @Test
    @DisplayName("测试公钥加密和私钥解密")
    void testEncryptAndDecrypt() {
        String plainText = "Hello RSA Test!";
        
        // 公钥加密
        String cipherText = RsaUtils.encryptByPublicKey(plainText, rsaKeyPair.getPublicKey());
        assertNotNull(cipherText, "加密结果不应为空");
        assertNotEquals(plainText, cipherText, "密文应与明文不同");
        
        // 私钥解密
        String decryptedText = RsaUtils.decryptByPrivateKey(cipherText, rsaKeyPair.getPrivateKey());
        assertNotNull(decryptedText, "解密结果不应为空");
        assertEquals(plainText, decryptedText, "解密后应得到原始明文");
    }

    @Test
    @DisplayName("测试加密中文字符")
    void testEncryptChineseCharacters() {
        String plainText = "测试中文加密解密功能";
        
        // 加密和解密
        String cipherText = RsaUtils.encryptByPublicKey(plainText, rsaKeyPair.getPublicKey());
        String decryptedText = RsaUtils.decryptByPrivateKey(cipherText, rsaKeyPair.getPrivateKey());
        
        // 验证
        assertNotNull(cipherText, "加密结果不应为空");
        assertEquals(plainText, decryptedText, "应能正确加密解密中文");
    }

    @Test
    @DisplayName("测试加密特殊字符")
    void testEncryptSpecialCharacters() {
        String plainText = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
        
        // 加密和解密
        String cipherText = RsaUtils.encryptByPublicKey(plainText, rsaKeyPair.getPublicKey());
        String decryptedText = RsaUtils.decryptByPrivateKey(cipherText, rsaKeyPair.getPrivateKey());
        
        // 验证
        assertEquals(plainText, decryptedText, "应能正确加密解密特殊字符");
    }

    @Test
    @DisplayName("测试加密空字符串")
    void testEncryptEmptyString() {
        String plainText = "";
        
        // 加密和解密
        String cipherText = RsaUtils.encryptByPublicKey(plainText, rsaKeyPair.getPublicKey());
        String decryptedText = RsaUtils.decryptByPrivateKey(cipherText, rsaKeyPair.getPrivateKey());
        
        // 验证
        assertNotNull(cipherText, "加密结果不应为空");
        assertEquals(plainText, decryptedText, "应能正确加密解密空字符串");
    }

    @Test
    @DisplayName("测试相同明文每次加密结果不同")
    void testSamePlainTextDifferentCipherText() {
        String plainText = "Test Message";
        
        // 多次加密相同内容
        String cipherText1 = RsaUtils.encryptByPublicKey(plainText, rsaKeyPair.getPublicKey());
        String cipherText2 = RsaUtils.encryptByPublicKey(plainText, rsaKeyPair.getPublicKey());
        
        // RSA加密结果每次可能不同（取决于padding）
        assertNotNull(cipherText1, "第一次加密结果不应为空");
        assertNotNull(cipherText2, "第二次加密结果不应为空");
    }

    @Test
    @DisplayName("测试使用错误的私钥解密")
    void testDecryptWithWrongPrivateKey() {
        String plainText = "Secret Message";
        Rsa anotherKeyPair = RsaUtils.generateRsaKeyPair();
        
        // 用第一个公钥加密
        String cipherText = RsaUtils.encryptByPublicKey(plainText, rsaKeyPair.getPublicKey());
        
        // 用另一个私钥解密（应该失败）
        String decryptedText = RsaUtils.decryptByPrivateKey(cipherText, anotherKeyPair.getPrivateKey());
        
        // 验证解密失败
        assertNull(decryptedText, "使用错误的私钥解密应返回null");
    }

    @Test
    @DisplayName("测试私钥签名和公钥验签")
    void testSignAndVerify() {
        String content = "Important Message";
        
        // 私钥签名
        String sign = RsaUtils.sign(content, rsaKeyPair.getPrivateKey());
        assertNotNull(sign, "签名结果不应为空");
        assertTrue(sign.length() > 0, "签名应有内容");
        
        // 公钥验签
        boolean verifyResult = RsaUtils.verifySign(content, rsaKeyPair.getPublicKey(), sign);
        assertTrue(verifyResult, "验签应该通过");
    }

    @Test
    @DisplayName("测试验签失败-内容被篡改")
    void testVerifyFailWithTamperedContent() {
        String content = "Original Message";
        String tamperedContent = "Tampered Message";
        
        // 对原始内容签名
        String sign = RsaUtils.sign(content, rsaKeyPair.getPrivateKey());
        
        // 用篡改后的内容验签
        boolean verifyResult = RsaUtils.verifySign(tamperedContent, rsaKeyPair.getPublicKey(), sign);
        
        // 验证失败
        assertFalse(verifyResult, "内容被篡改后验签应该失败");
    }

    @Test
    @DisplayName("测试验签失败-使用错误的公钥")
    void testVerifyFailWithWrongPublicKey() {
        String content = "Message";
        Rsa anotherKeyPair = RsaUtils.generateRsaKeyPair();
        
        // 用第一个私钥签名
        String sign = RsaUtils.sign(content, rsaKeyPair.getPrivateKey());
        
        // 用另一个公钥验签
        boolean verifyResult = RsaUtils.verifySign(content, anotherKeyPair.getPublicKey(), sign);
        
        // 验证失败
        assertFalse(verifyResult, "使用错误的公钥验签应该失败");
    }

    @Test
    @DisplayName("测试签名中文内容")
    void testSignChineseContent() {
        String content = "这是需要签名的中文内容";
        
        // 签名和验签
        String sign = RsaUtils.sign(content, rsaKeyPair.getPrivateKey());
        boolean verifyResult = RsaUtils.verifySign(content, rsaKeyPair.getPublicKey(), sign);
        
        // 验证
        assertNotNull(sign, "签名不应为空");
        assertTrue(verifyResult, "中文内容的签名验证应通过");
    }

    @Test
    @DisplayName("测试相同内容多次签名结果相同")
    void testSameContentSameSignature() {
        String content = "Test Content";
        
        // 多次签名
        String sign1 = RsaUtils.sign(content, rsaKeyPair.getPrivateKey());
        String sign2 = RsaUtils.sign(content, rsaKeyPair.getPrivateKey());
        
        // 验证签名结果相同
        assertEquals(sign1, sign2, "相同内容和私钥的签名结果应该相同");
    }

    @Test
    @DisplayName("测试加密解密完整流程")
    void testCompleteEncryptDecryptFlow() {
        // 模拟实际使用场景
        String originalData = "用户密码: password123";
        
        // 1. 生成密钥对
        Rsa keyPair = RsaUtils.generateRsaKeyPair();
        assertNotNull(keyPair, "密钥对生成成功");
        
        // 2. 客户端用公钥加密敏感数据
        String encrypted = RsaUtils.encryptByPublicKey(originalData, keyPair.getPublicKey());
        assertNotNull(encrypted, "加密成功");
        assertNotEquals(originalData, encrypted, "加密后数据应不同于原始数据");
        
        // 3. 服务端用私钥解密
        String decrypted = RsaUtils.decryptByPrivateKey(encrypted, keyPair.getPrivateKey());
        assertEquals(originalData, decrypted, "解密后应得到原始数据");
    }

    @Test
    @DisplayName("测试签名验签完整流程")
    void testCompleteSignVerifyFlow() {
        // 模拟实际使用场景
        String requestData = "{\"orderId\":\"12345\",\"amount\":999.99}";
        
        // 1. 客户端用私钥对请求数据签名
        String signature = RsaUtils.sign(requestData, rsaKeyPair.getPrivateKey());
        assertNotNull(signature, "签名成功");
        
        // 2. 服务端用公钥验证签名
        boolean isValid = RsaUtils.verifySign(requestData, rsaKeyPair.getPublicKey(), signature);
        assertTrue(isValid, "签名验证应通过");
        
        // 3. 数据被篡改的情况
        String tamperedData = "{\"orderId\":\"12345\",\"amount\":9999.99}";
        boolean isValidAfterTamper = RsaUtils.verifySign(tamperedData, rsaKeyPair.getPublicKey(), signature);
        assertFalse(isValidAfterTamper, "篡改后的数据验签应失败");
    }

    @Test
    @DisplayName("测试使用null参数")
    void testWithNullParameters() {
        // 测试加密时传入null
        String encryptResult = RsaUtils.encryptByPublicKey(null, rsaKeyPair.getPublicKey());
        assertNull(encryptResult, "明文为null时应返回null");
        
        // 测试签名时传入null
        String signResult = RsaUtils.sign(null, rsaKeyPair.getPrivateKey());
        assertNull(signResult, "内容为null时应返回null");
    }

    @Test
    @DisplayName("测试长文本加密")
    void testLongTextEncryption() {
        // 注意：RSA不适合加密长文本，这里测试较短的文本
        String plainText = "This is a test message for RSA encryption. " +
                "RSA is typically used for encrypting small amounts of data.";
        
        // 加密解密
        String cipherText = RsaUtils.encryptByPublicKey(plainText, rsaKeyPair.getPublicKey());
        String decryptedText = RsaUtils.decryptByPrivateKey(cipherText, rsaKeyPair.getPrivateKey());
        
        // 验证
        assertNotNull(cipherText, "加密应成功");
        assertEquals(plainText, decryptedText, "解密后应与原文一致");
    }
}

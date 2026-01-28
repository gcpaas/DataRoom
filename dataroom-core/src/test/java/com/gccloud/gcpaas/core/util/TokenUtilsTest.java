package com.gccloud.gcpaas.core.util;

import com.alibaba.fastjson2.JSONObject;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * TokenUtils 单元测试
 */
@DisplayName("TokenUtils 工具类测试")
class TokenUtilsTest {

    private static final String TOKEN_KEY = "dataRoomToken";

    @Test
    @DisplayName("测试构造函数抛出异常")
    void testConstructorThrowsException() {
        // 验证构造函数会抛出异常
        assertThrows(IllegalStateException.class, () -> {
            new TokenUtils();
        }, "构造函数应抛出IllegalStateException");
    }

    @Test
    @DisplayName("测试从请求参数获取token")
    void testGetTokenFromParameter() {
        // Mock HttpServletRequest
        HttpServletRequest request = mock(HttpServletRequest.class);
        String expectedToken = "test_token_from_param";
        
        // 设置mock行为
        when(request.getParameter(TOKEN_KEY)).thenReturn(expectedToken);
        
        // 获取token
        String token = TokenUtils.getToken(request);
        
        // 验证结果
        assertEquals(expectedToken, token, "应从请求参数获取token");
        verify(request).getParameter(TOKEN_KEY);
    }

    @Test
    @DisplayName("测试从请求头获取token")
    void testGetTokenFromHeader() {
        // Mock HttpServletRequest
        HttpServletRequest request = mock(HttpServletRequest.class);
        String expectedToken = "test_token_from_header";
        
        // 设置mock行为：参数为空，从header获取
        when(request.getParameter(TOKEN_KEY)).thenReturn(null);
        when(request.getHeader(TOKEN_KEY)).thenReturn(expectedToken);
        
        // 获取token
        String token = TokenUtils.getToken(request);
        
        // 验证结果
        assertEquals(expectedToken, token, "应从请求头获取token");
        verify(request).getParameter(TOKEN_KEY);
        verify(request).getHeader(TOKEN_KEY);
    }

    @Test
    @DisplayName("测试从Cookie获取token")
    void testGetTokenFromCookie() {
        // Mock HttpServletRequest
        HttpServletRequest request = mock(HttpServletRequest.class);
        String expectedToken = "test_token_from_cookie";
        
        // 创建Cookie
        Cookie tokenCookie = new Cookie(TOKEN_KEY, expectedToken);
        Cookie[] cookies = {tokenCookie};
        
        // 设置mock行为
        when(request.getParameter(TOKEN_KEY)).thenReturn(null);
        when(request.getHeader(TOKEN_KEY)).thenReturn(null);
        when(request.getCookies()).thenReturn(cookies);
        
        // 获取token
        String token = TokenUtils.getToken(request);
        
        // 验证结果
        assertEquals(expectedToken, token, "应从Cookie获取token");
        verify(request).getCookies();
    }

    @Test
    @DisplayName("测试从多个Cookie中获取正确的token")
    void testGetTokenFromMultipleCookies() {
        // Mock HttpServletRequest
        HttpServletRequest request = mock(HttpServletRequest.class);
        String expectedToken = "correct_token";
        
        // 创建多个Cookie
        Cookie[] cookies = {
            new Cookie("sessionId", "session123"),
            new Cookie(TOKEN_KEY, expectedToken),
            new Cookie("otherId", "other456")
        };
        
        // 设置mock行为
        when(request.getParameter(TOKEN_KEY)).thenReturn(null);
        when(request.getHeader(TOKEN_KEY)).thenReturn(null);
        when(request.getCookies()).thenReturn(cookies);
        
        // 获取token
        String token = TokenUtils.getToken(request);
        
        // 验证结果
        assertEquals(expectedToken, token, "应从多个Cookie中找到正确的token");
    }

    @Test
    @DisplayName("测试没有Cookie时返回null")
    void testGetTokenWhenNoCookies() {
        // Mock HttpServletRequest
        HttpServletRequest request = mock(HttpServletRequest.class);
        
        // 设置mock行为：都为空
        when(request.getParameter(TOKEN_KEY)).thenReturn(null);
        when(request.getHeader(TOKEN_KEY)).thenReturn(null);
        when(request.getCookies()).thenReturn(null);
        
        // 获取token
        String token = TokenUtils.getToken(request);
        
        // 验证结果
        assertNull(token, "没有Cookie时应返回null");
    }

    @Test
    @DisplayName("测试Cookie数组为空时返回null")
    void testGetTokenWhenEmptyCookies() {
        // Mock HttpServletRequest
        HttpServletRequest request = mock(HttpServletRequest.class);
        
        // 设置mock行为
        when(request.getParameter(TOKEN_KEY)).thenReturn(null);
        when(request.getHeader(TOKEN_KEY)).thenReturn(null);
        when(request.getCookies()).thenReturn(new Cookie[0]);
        
        // 获取token
        String token = TokenUtils.getToken(request);
        
        // 验证结果
        assertNull(token, "Cookie数组为空时应返回null");
    }

    @Test
    @DisplayName("测试参数优先级高于header")
    void testParameterPriorityOverHeader() {
        // Mock HttpServletRequest
        HttpServletRequest request = mock(HttpServletRequest.class);
        String paramToken = "token_from_param";
        String headerToken = "token_from_header";
        
        // 设置mock行为
        when(request.getParameter(TOKEN_KEY)).thenReturn(paramToken);
        when(request.getHeader(TOKEN_KEY)).thenReturn(headerToken);
        
        // 获取token
        String token = TokenUtils.getToken(request);
        
        // 验证结果：应返回参数中的token
        assertEquals(paramToken, token, "参数优先级应高于header");
        verify(request).getParameter(TOKEN_KEY);
        verify(request, never()).getHeader(TOKEN_KEY); // 不应该调用getHeader
    }

    @Test
    @DisplayName("测试header优先级高于Cookie")
    void testHeaderPriorityOverCookie() {
        // Mock HttpServletRequest
        HttpServletRequest request = mock(HttpServletRequest.class);
        String headerToken = "token_from_header";
        Cookie[] cookies = {new Cookie(TOKEN_KEY, "token_from_cookie")};
        
        // 设置mock行为
        when(request.getParameter(TOKEN_KEY)).thenReturn(null);
        when(request.getHeader(TOKEN_KEY)).thenReturn(headerToken);
        when(request.getCookies()).thenReturn(cookies);
        
        // 获取token
        String token = TokenUtils.getToken(request);
        
        // 验证结果：应返回header中的token
        assertEquals(headerToken, token, "header优先级应高于Cookie");
        verify(request, never()).getCookies(); // 不应该调用getCookies
    }

    @Test
    @DisplayName("测试解析标准Base64编码的JWT")
    void testParseStandardBase64Jwt() {
        // 构造一个简单的JWT token（header.payload.signature）
        JSONObject payload = new JSONObject();
        payload.put("userId", "123");
        payload.put("username", "testuser");
        payload.put("exp", 1234567890);
        
        String payloadJson = payload.toJSONString();
        String payloadBase64 = Base64.getEncoder().encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
        String token = "header." + payloadBase64 + ".signature";
        
        // 解析token
        JSONObject result = TokenUtils.parseWithOutValidate(token);
        
        // 验证结果
        assertNotNull(result, "解析结果不应为空");
        assertEquals("123", result.getString("userId"), "userId应正确");
        assertEquals("testuser", result.getString("username"), "username应正确");
    }

    @Test
    @DisplayName("测试解析URL安全Base64编码的JWT")
    void testParseUrlSafeBase64Jwt() {
        // 构造使用URL安全Base64编码的JWT
        JSONObject payload = new JSONObject();
        payload.put("userId", "456");
        payload.put("role", "admin");
        
        String payloadJson = payload.toJSONString();
        String payloadBase64 = Base64.getUrlEncoder().encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
        String token = "header." + payloadBase64 + ".signature";
        
        // 解析token
        JSONObject result = TokenUtils.parseWithOutValidate(token);
        
        // 验证结果
        assertNotNull(result, "解析结果不应为空");
        assertEquals("456", result.getString("userId"), "userId应正确");
        assertEquals("admin", result.getString("role"), "role应正确");
    }

    @Test
    @DisplayName("测试解析包含中文的JWT")
    void testParseJwtWithChineseContent() {
        JSONObject payload = new JSONObject();
        payload.put("username", "张三");
        payload.put("dept", "研发部");
        
        String payloadJson = payload.toJSONString();
        String payloadBase64 = Base64.getEncoder().encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
        String token = "header." + payloadBase64 + ".signature";
        
        // 解析token
        JSONObject result = TokenUtils.parseWithOutValidate(token);
        
        // 验证结果
        assertNotNull(result, "解析结果不应为空");
        assertEquals("张三", result.getString("username"), "中文用户名应正确");
        assertEquals("研发部", result.getString("dept"), "中文部门应正确");
    }

    @Test
    @DisplayName("测试解析无效token返回null")
    void testParseInvalidTokenReturnsNull() {
        // 无效的token格式
        String invalidToken = "invalid.token";
        
        // 解析token
        JSONObject result = TokenUtils.parseWithOutValidate(invalidToken);
        
        // 验证结果
        assertNull(result, "无效token应返回null");
    }

    @Test
    @DisplayName("测试解析null token返回null")
    void testParseNullTokenReturnsNull() {
        // 解析null token
        JSONObject result = TokenUtils.parseWithOutValidate(null);
        
        // 验证结果
        assertNull(result, "null token应返回null");
    }

    @Test
    @DisplayName("测试解析空字符串token返回null")
    void testParseEmptyTokenReturnsNull() {
        // 解析空字符串
        JSONObject result = TokenUtils.parseWithOutValidate("");
        
        // 验证结果
        assertNull(result, "空字符串token应返回null");
    }

    @Test
    @DisplayName("测试解析格式错误的JWT")
    void testParseMalformedJwt() {
        // 格式错误的JWT（payload不是有效的Base64）
        String malformedToken = "header.not_valid_base64.signature";
        
        // 解析token
        JSONObject result = TokenUtils.parseWithOutValidate(malformedToken);
        
        // 验证结果（应捕获异常并返回null）
        assertNull(result, "格式错误的JWT应返回null");
    }

    @Test
    @DisplayName("测试解析包含复杂数据的JWT")
    void testParseComplexJwt() {
        JSONObject payload = new JSONObject();
        payload.put("userId", "789");
        payload.put("username", "testuser");
        payload.put("roles", new String[]{"admin", "user"});
        payload.put("permissions", new String[]{"read", "write", "delete"});
        payload.put("exp", System.currentTimeMillis() / 1000 + 3600);
        
        String payloadJson = payload.toJSONString();
        String payloadBase64 = Base64.getEncoder().encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
        String token = "header." + payloadBase64 + ".signature";
        
        // 解析token
        JSONObject result = TokenUtils.parseWithOutValidate(token);
        
        // 验证结果
        assertNotNull(result, "解析结果不应为空");
        assertEquals("789", result.getString("userId"), "userId应正确");
        assertEquals("testuser", result.getString("username"), "username应正确");
        assertNotNull(result.get("roles"), "应包含roles字段");
        assertNotNull(result.get("permissions"), "应包含permissions字段");
    }

    @Test
    @DisplayName("测试获取token优先级：参数 > Header > Cookie")
    void testTokenPriorityChain() {
        // Mock HttpServletRequest
        HttpServletRequest request = mock(HttpServletRequest.class);
        
        // 场景1：只有Cookie
        when(request.getParameter(TOKEN_KEY)).thenReturn(null);
        when(request.getHeader(TOKEN_KEY)).thenReturn(null);
        when(request.getCookies()).thenReturn(new Cookie[]{new Cookie(TOKEN_KEY, "cookie_token")});
        assertEquals("cookie_token", TokenUtils.getToken(request));
        
        // 场景2：有Header和Cookie
        Mockito.reset(request);
        when(request.getParameter(TOKEN_KEY)).thenReturn(null);
        when(request.getHeader(TOKEN_KEY)).thenReturn("header_token");
        when(request.getCookies()).thenReturn(new Cookie[]{new Cookie(TOKEN_KEY, "cookie_token")});
        assertEquals("header_token", TokenUtils.getToken(request));
        
        // 场景3：有参数、Header和Cookie
        Mockito.reset(request);
        when(request.getParameter(TOKEN_KEY)).thenReturn("param_token");
        when(request.getHeader(TOKEN_KEY)).thenReturn("header_token");
        when(request.getCookies()).thenReturn(new Cookie[]{new Cookie(TOKEN_KEY, "cookie_token")});
        assertEquals("param_token", TokenUtils.getToken(request));
    }
}

package com.gccloud.gcpaas.core.shiro;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.shiro.ShiroAuthFilter;
import com.gccloud.gcpaas.dataroom.core.shiro.ShiroAuthToken;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.Cookie;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.subject.Subject;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

class ShiroAuthFilterTest {

    @ParameterizedTest
    @ValueSource(strings = {"Bearer mcp-secret", "bEaReR   mcp-secret  "})
    void mcpBearerTokenIsMarkedForExactContextPathRoute(String authorization) {
        ShiroAuthFilter filter = new ShiroAuthFilter("customToken");
        MockHttpServletRequest request = request("/dataRoom", "/dataRoom/mcp");
        request.addHeader("Authorization", authorization);
        request.addParameter("customToken", "jwt-token");
        request.setCookies(new Cookie("customToken", "cookie-jwt"));

        ShiroAuthToken token = createToken(filter, request);

        assertTrue(token.isMcpToken());
        assertEquals("mcp-secret", token.getPrincipal());
        assertEquals("mcp-secret", token.getCredentials());
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "/dataRoom", "/custom", "/tenant/dataRoom"})
    void mcpRouteUsesContextPathInsteadOfHardcodedPrefix(String contextPath) {
        ShiroAuthFilter filter = new ShiroAuthFilter("customToken");
        MockHttpServletRequest request = request(contextPath, contextPath + "/mcp");
        request.addHeader("Authorization", "Bearer mcp-secret");

        ShiroAuthToken token = createToken(filter, request);

        assertTrue(token.isMcpToken());
        assertEquals("mcp-secret", token.getPrincipal());
    }

    @ParameterizedTest
    @CsvSource({
            "/dataRoom, /dataRoom/user/current",
            "/dataRoom, /dataRoom/other/mcp",
            "/dataRoom, /dataRoom/dataRoom/mcp",
            "/dataRoom, /dataRoom/mcp/",
            "/dataRoom, /dataRoom/mcp/extra",
            "/dataRoom, /dataRoom/not-mcp",
            "/dataRoom, /dataRoom/mcp.json",
            "'', /dataRoom/mcp",
            "/custom, /custom/dataRoom/mcp"
    })
    void nonMcpAndSimilarSuffixRoutesKeepRegularJwtToken(String contextPath, String uri) {
        ShiroAuthFilter filter = new ShiroAuthFilter("customToken");
        MockHttpServletRequest request = request(contextPath, uri);
        request.addHeader("Authorization", "Bearer should-not-be-used");
        request.addHeader("customToken", "jwt-token");

        ShiroAuthToken token = createToken(filter, request);

        assertFalse(token.isMcpToken());
        assertEquals("jwt-token", token.getPrincipal());
        assertEquals("jwt-token", token.getCredentials());
    }

    @ParameterizedTest
    @ValueSource(strings = {"parameter", "header", "cookie"})
    void mcpRouteWithoutAuthorizationHeaderRetainsRegularJwtCompatibility(String source) {
        ShiroAuthFilter filter = new ShiroAuthFilter("customToken");
        MockHttpServletRequest request = request("/dataRoom", "/dataRoom/mcp");
        switch (source) {
            case "parameter" -> request.addParameter("customToken", "jwt-token");
            case "header" -> request.addHeader("customToken", "jwt-token");
            case "cookie" -> request.setCookies(new Cookie("customToken", "jwt-token"));
        }

        ShiroAuthToken token = createToken(filter, request);

        assertFalse(token.isMcpToken());
        assertEquals("jwt-token", token.getPrincipal());
        assertEquals("jwt-token", token.getCredentials());
    }

    @ParameterizedTest
    @CsvSource({
            "'', ''",
            "' ', ''",
            "Bearer, ''",
            "'Bearer ', ''",
            "'Bearer   ', ''",
            "Basic jwt-token, ''",
            "Bearer-not-a-scheme, ''",
            "Bearer invalid-token, invalid-token"
    })
    void emptyOrInvalidBearerFailsMcpLoginWithoutFallingBackToJwt(String authorization, String expectedToken)
            throws Exception {
        Subject subject = mock(Subject.class);
        doThrow(new AuthenticationException(new DataRoomException("MCP令牌无效或已过期", 401)))
                .when(subject).login(any(AuthenticationToken.class));
        ShiroAuthFilter filter = filterFor(subject);
        MockHttpServletRequest request = spy(request("/dataRoom", "/dataRoom/mcp"));
        request.addHeader("Authorization", authorization);
        request.addParameter("customToken", "jwt-token");
        request.addHeader("customToken", "header-jwt");
        request.setCookies(new Cookie("customToken", "cookie-jwt"));
        MockHttpServletResponse response = new MockHttpServletResponse();

        ShiroAuthToken token = createToken(filter, request);
        Boolean allowed = ReflectionTestUtils.invokeMethod(filter, "onAccessDenied", request, response);

        assertTrue(token.isMcpToken());
        assertEquals(expectedToken, token.getPrincipal());
        assertEquals(expectedToken, token.getCredentials());
        assertFalse(allowed);
        ArgumentCaptor<AuthenticationToken> captor = ArgumentCaptor.forClass(AuthenticationToken.class);
        verify(subject).login(captor.capture());
        ShiroAuthToken loginToken = assertInstanceOf(ShiroAuthToken.class, captor.getValue());
        assertTrue(loginToken.isMcpToken());
        assertEquals(expectedToken, loginToken.getPrincipal());
        verify(request, never()).getParameter("customToken");
        verify(request, never()).getHeader("customToken");
        verify(request, never()).getCookies();
        JsonNode error = new ObjectMapper().readTree(response.getContentAsString());
        assertEquals(401, error.get("code").asInt());
        assertEquals("MCP令牌无效或已过期", error.get("message").asText());
        assertEquals(401, response.getStatus());
        assertEquals("Bearer", response.getHeader("WWW-Authenticate"));
    }

    @Test
    void mcpRouteWithoutCredentialsReturnsHttp401() throws Exception {
        Subject subject = mock(Subject.class);
        ShiroAuthFilter filter = filterFor(subject);
        MockHttpServletRequest request = request("/dataRoom", "/dataRoom/mcp");
        MockHttpServletResponse response = new MockHttpServletResponse();

        Boolean allowed = ReflectionTestUtils.invokeMethod(filter, "onAccessDenied", request, response);

        assertFalse(allowed);
        assertEquals(401, response.getStatus());
        assertEquals("Bearer", response.getHeader("WWW-Authenticate"));
        verifyNoInteractions(subject);
    }

    @Test
    void onAccessDeniedUsesMcpLoginWithoutJwt() throws Exception {
        Subject subject = mock(Subject.class);
        ShiroAuthFilter filter = filterFor(subject);
        MockHttpServletRequest request = spy(request("/dataRoom", "/dataRoom/mcp"));
        request.addHeader("Authorization", "Bearer mcp-secret");
        MockHttpServletResponse response = new MockHttpServletResponse();

        Boolean allowed = ReflectionTestUtils.invokeMethod(filter, "onAccessDenied", request, response);

        assertTrue(allowed);
        ArgumentCaptor<AuthenticationToken> captor = ArgumentCaptor.forClass(AuthenticationToken.class);
        verify(subject).login(captor.capture());
        ShiroAuthToken token = assertInstanceOf(ShiroAuthToken.class, captor.getValue());
        assertTrue(token.isMcpToken());
        assertEquals("mcp-secret", token.getPrincipal());
        verify(request, never()).getParameter("customToken");
        verify(request, never()).getHeader("customToken");
        verify(request, never()).getCookies();
        assertEquals("", response.getContentAsString());
    }

    @Test
    void authFailureUsesDataRoomExceptionMessageWhenPresent() {
        ShiroAuthFilter filter = new ShiroAuthFilter("customToken");
        AuthenticationException exception = new AuthenticationException(
                new AuthenticationException(new DataRoomException("分享链接已停用", 401))
        );

        Resp<String> resp = ReflectionTestUtils.invokeMethod(filter, "getAuthError", exception);

        assertEquals(401, resp.getCode());
        assertEquals("分享链接已停用", resp.getMessage());
    }

    @Test
    void authFailureFallsBackToDefaultMessage() {
        ShiroAuthFilter filter = new ShiroAuthFilter("customToken");

        Resp<String> resp = ReflectionTestUtils.invokeMethod(filter, "getAuthError", new AuthenticationException("failed"));

        assertEquals(401, resp.getCode());
        assertEquals("未登录或token已过期或认证异常", resp.getMessage());
    }

    private static ShiroAuthFilter filterFor(Subject subject) {
        return new ShiroAuthFilter("customToken") {
            @Override
            protected Subject getSubject(ServletRequest request, ServletResponse response) {
                return subject;
            }

            @Override
            public String getOrigin() {
                return "test-origin";
            }
        };
    }

    private static MockHttpServletRequest request(String contextPath, String requestUri) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setContextPath(contextPath);
        request.setRequestURI(requestUri);
        return request;
    }

    private static ShiroAuthToken createToken(ShiroAuthFilter filter, MockHttpServletRequest request) {
        AuthenticationToken token = ReflectionTestUtils.invokeMethod(
                filter, "createToken", request, new MockHttpServletResponse());
        return assertInstanceOf(ShiroAuthToken.class, token);
    }
}
